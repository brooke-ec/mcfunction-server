package ec.brooke.mcfunctionserver;

import com.mojang.brigadier.CommandDispatcher;
import io.javalin.http.ForbiddenResponse;
import net.minecraft.DetectedVersion;
import net.minecraft.FileUtil;
import net.minecraft.commands.CommandSource;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.commands.functions.CommandFunction;
import net.minecraft.network.chat.CommonComponents;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.ServerFunctionLibrary;
import net.minecraft.server.packs.PackLocationInfo;
import net.minecraft.server.packs.PackResources;
import net.minecraft.server.packs.PackType;
import net.minecraft.server.packs.PathPackResources;
import net.minecraft.server.packs.repository.PackSource;
import net.minecraft.server.packs.resources.MultiPackResourceManager;
import net.minecraft.world.level.storage.LevelResource;
import net.minecraft.world.phys.Vec2;
import net.minecraft.world.phys.Vec3;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.input.CloseShieldInputStream;
import org.apache.commons.io.input.TeeInputStream;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Stream;

/**
 * Wrapper for accessing and managing a datapack's mcfunctions.
 */
public class MutableFunctionLibrary {
    private final Map<ResourceLocation, CommandFunction<CommandSourceStack>> functions = new ConcurrentHashMap<>();
    private final CommandDispatcher<CommandSourceStack> dispatcher;
    private final CommandSourceStack compilationSource;
    public static final String DATA_DIR = "data";
    public final Path root;

    public MutableFunctionLibrary(MinecraftServer server, String name) {
        this.root = server.getWorldPath(LevelResource.DATAPACK_DIR).resolve(name).toAbsolutePath().normalize();
        this.dispatcher = server.getCommands().getDispatcher();
        this.compilationSource = new CommandSourceStack(
                CommandSource.NULL,
                Vec3.ZERO,
                Vec2.ZERO,
                null,
                server.getFunctionCompilationLevel(),
                "",
                CommonComponents.EMPTY,
                null,
                null
        );
    }

    /**
     * Retrieves a specific function by its ResourceLocation.
     * @param location The ResourceLocation of the function to retrieve.
     * @return An Optional containing the CommandFunction if it exists, or empty if it does not.
     */
    public Optional<CommandFunction<CommandSourceStack>> getFunction(ResourceLocation location) {
        return Optional.ofNullable(functions.get(location));
    }

    /**
     * Retrieves all functions in the library.
     * @return A map of ResourceLocations to CommandFunctions.
     */
    public Map<ResourceLocation, CommandFunction<CommandSourceStack>> getFunctions() {
        return functions;
    }

    /**
     * Validates the datapack, creating the directory and pack meta file if they do not exist.
     * @throws IOException if an I/O error occurs while creating the directories or writing the pack meta file.
     */
    public void validate() throws IOException {
        Path meta = root.resolve(PackResources.PACK_META);
        FileUtil.createDirectoriesSafe(meta.getParent());

        try (
                BufferedWriter writer = Files.newBufferedWriter(meta, StandardCharsets.UTF_8);
                InputStream reader = MutableFunctionLibrary.class.getResourceAsStream("/pack.mcmeta.template");
        ) {
            if (reader == null) throw new IOException("Template file for pack meta not found");
            int version = DetectedVersion.BUILT_IN.getPackVersion(PackType.SERVER_DATA);
            writer.write(new String(reader.readAllBytes(), StandardCharsets.UTF_8).formatted(version));
        } catch (IOException e) {
            throw new IOException("Failed to create pack meta file at " + meta, e);
        }
    }

    /**
     * Reloads the function library from disk.
     * @throws IOException if an I/O error occurs while reading the mcfunction files.
     */
    public void reload() throws IOException {
        functions.clear();
        for (ResourceLocation location : index()) load(location, get(location));
    }

    /**
     * Sets up the function library by validating the pack structure and loading functions from disk.
     * @throws IOException if an I/O error occurs during validation or reloading.
     */
    public void setup() throws IOException {
        validate();
        reload();
    }

    /**
     * Indexes the mcfunction files in the pack directory.
     * @return An array of ResourceLocations representing the indexed mcfunction files.
     */
    public List<ResourceLocation> index() {
        PackLocationInfo location = new PackLocationInfo("", Component.empty(), PackSource.WORLD, Optional.empty());
        try (
                PathPackResources resources = new PathPackResources(location, root);
                MultiPackResourceManager manager = new MultiPackResourceManager(PackType.SERVER_DATA, List.of(resources));
        ) {
            return ServerFunctionLibrary.LISTER.listMatchingResources(manager).keySet().stream().map(ServerFunctionLibrary.LISTER::fileToId).toList();
        }
    }

    /**
     * Retrieves the path to a specific mcfunction file in the pack.
     * @param location The ResourceLocation of the mcfunction file.
     * @return The Path to the mcfunction file.
     */
    public Path getFunctionPath(ResourceLocation location) {
        ResourceLocation file = ServerFunctionLibrary.LISTER.idToFile(location);
        Path path = root.resolve(DATA_DIR).resolve(file.getNamespace()).resolve(file.getPath());
        if (!isPathValid(path)) throw new ForbiddenResponse("File path is invalid: " + path);
        return path;
    }

    /**
     * Validates if a given path is within the root directory of the pack.
     * @param path The Path to validate.
     * @return true if the path is valid, false otherwise.
     */
    public boolean isPathValid(Path path) {
        return path.toAbsolutePath().normalize().startsWith(root);
    }

    /**
     * Retrieves the path to a specific directory in the pack.
     * @param location The ResourceLocation of the directory.
     * @return The Path to the directory.
     */
    private Path getDirectoryPath(ResourceLocation location) {
        return getDirectoryPath(getFunctionPath(location));
    }

    /**
     * Retrieves the path to a specific directory in the pack.
     * @param path The path to the directory.
     * @return The Path to the directory.
     */
    private Path getDirectoryPath(Path path) {
        return path.resolveSibling(FilenameUtils.removeExtension(path.getFileName().toString()));
    }

    /**
     * Resolves a given path to ensure it exists, removing the file extension if necessary.
     * @param path The Path to resolve.
     * @return The resolved Path.
     * @throws FileNotFoundException if no file or folder exists with that name.
     */
    private Path resolve(Path path) throws FileNotFoundException {
        if (!Files.exists(path)) path = getDirectoryPath(path);
        if (!Files.exists(path)) throw new FileNotFoundException("No file or folder: " + path);
        else return path;
    }

    /**
     * Retrieves an InputStream for a specific mcfunction file in the pack.
     * @param location The ResourceLocation of the mcfunction file.
     * @return An InputStream for the mcfunction file.
     * @throws FileNotFoundException if the file does not exist or the path is invalid.
     */
    public InputStream get(ResourceLocation location) throws FileNotFoundException {
        return new FileInputStream(getFunctionPath(location).toFile());
    }

    /**
     * Writes content to a specific mcfunction file in the pack.
     * @param location The ResourceLocation of the mcfunction file.
     * @param input The InputStream containing the content to write.
     * @throws FileNotFoundException if the path is invalid.
     * @throws IOException if an I/O error occurs while writing to the file.
     */
    public void put(ResourceLocation location, InputStream input) throws IOException {
        Path path = getFunctionPath(location);
        FileUtil.createDirectoriesSafe(path.getParent());
        try (
                OutputStream out = new FileOutputStream(path.toFile());
                TeeInputStream tee = new TeeInputStream(input, out, true)
        ) { load(location, tee); }
    }

    /**
     * Deletes a specific mcfunction file from the pack.
     * @param location The ResourceLocation of the mcfunction file to delete.
     * @throws IOException if the file does not exist, the path is invalid, or an I/O error occurs while deleting the file.
     */
    public void delete(ResourceLocation location) throws IOException {
        Path path = resolve(getFunctionPath(location));
        if (!FileUtils.deleteQuietly(path.toFile())) throw new IOException("Failed to delete file: " + path);
        this.functions.remove(location);
        deleteEmptyDirectories(path);
    }

    /**
     * Copies a mcfunction file from one location to another within the pack.
     * @param source The ResourceLocation of the source mcfunction file.
     * @param destination The ResourceLocation of the destination mcfunction file.
     * @throws IOException if the source or destination path is invalid, or an I/O error occurs while copying the file.
     */
    public void copy(ResourceLocation source, ResourceLocation destination) throws IOException {
        prepareTransfer(source, destination, Files::copy);
    }

    /**
     * Moves a mcfunction file from one location to another within the pack.
     * @param source The ResourceLocation of the source mcfunction file.
     * @param destination The ResourceLocation of the destination mcfunction file.
     * @throws IOException if the source or destination path is invalid, or an I/O error occurs while moving the file.
     */
    public void move(ResourceLocation source, ResourceLocation destination) throws IOException {
        prepareTransfer(source, destination, Files::move);
    }

    private void deleteEmptyDirectories(Path path) throws IOException {
        while (true) {
            path = path.getParent();
            try (Stream<Path> files = Files.list(path)) {
                if (path.equals(root) || files.findFirst().isPresent()) break;
                boolean ignored = path.toFile().delete();
            }
        }
    }

    private void prepareTransfer(
            ResourceLocation source,
            ResourceLocation destination,
            IOBiConsumer<Path, Path> consumer
    ) throws IOException {
        Path sourcePath = resolve(getFunctionPath(source));
        Path destinationPath = sourcePath.toFile().isDirectory() ? getDirectoryPath(destination) : getFunctionPath(destination);

        FileUtil.createDirectoriesSafe(destinationPath.getParent());
        consumer.accept(sourcePath, destinationPath);
        deleteEmptyDirectories(sourcePath);
        reload(); // Too many potential side effects to handle, so just reload everything
    }

    /**
     * Compiles the mcfunction file from the InputStream using the provided ResourceLocation.
     * @param location The location of the mcfunction file.
     * @param input The InputStream containing the mcfunction file content.
     * @throws IOException if an I/O error occurs while reading the InputStream or compiling the function.
     */
    private void load(ResourceLocation location, InputStream input) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            functions.put(location, CommandFunction.fromLines(location, this.dispatcher, this.compilationSource, reader.lines().toList()));
        }
    }


    @FunctionalInterface
    private interface IOBiConsumer<T, U> {
        void accept(T t, U u) throws IOException;
    }
}
