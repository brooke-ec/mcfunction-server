package ec.brooke.mcfunctionserver;

import io.javalin.http.ForbiddenResponse;
import net.minecraft.DetectedVersion;
import net.minecraft.FileUtil;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.ServerFunctionLibrary;
import net.minecraft.server.packs.PackLocationInfo;
import net.minecraft.server.packs.PackResources;
import net.minecraft.server.packs.PackType;
import net.minecraft.server.packs.PathPackResources;
import net.minecraft.server.packs.repository.PackSource;
import net.minecraft.server.packs.resources.MultiPackResourceManager;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

/**
 * Wrapper for accessing and managing a datapack's mcfunction files.
 */
public class PackAccessor {
    public static final String DATA_DIR = "data";
    public final Path root;

    public PackAccessor(Path root) {
        this.root = root.toAbsolutePath().normalize();
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
                InputStream reader = PackAccessor.class.getResourceAsStream("/pack.mcmeta.template");
        ) {
            if (reader == null) throw new IOException("Template file for pack meta not found");
            int version = DetectedVersion.BUILT_IN.getPackVersion(PackType.SERVER_DATA);
            writer.write(new String(reader.readAllBytes(), StandardCharsets.UTF_8).formatted(version));
        } catch (IOException e) {
            throw new IOException("Failed to create pack meta file at " + meta, e);
        }
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
    public Path getFunction(ResourceLocation location) {
        ResourceLocation file = ServerFunctionLibrary.LISTER.idToFile(location);
        Path path = root.resolve(DATA_DIR).resolve(file.getNamespace()).resolve(file.getPath());
        if (!pathValid(path)) throw new ForbiddenResponse("File path is invalid: " + path);
        return path;
    }

    /**
     * Validates if a given path is within the root directory of the pack.
     * @param path The Path to validate.
     * @return true if the path is valid, false otherwise.
     */
    public boolean pathValid(Path path) {
        return path.toAbsolutePath().normalize().startsWith(root);
    }

    /**
     * Retrieves the path to a specific directory in the pack.
     * @param location The ResourceLocation of the directory.
     * @return The Path to the directory.
     */
    private Path getDirectory(ResourceLocation location) {
        return getDirectory(getFunction(location));
    }

    /**
     * Retrieves the path to a specific directory in the pack.
     * @param path The path to the directory.
     * @return The Path to the directory.
     */
    private Path getDirectory(Path path) {
        return path.resolveSibling(FilenameUtils.removeExtension(path.getFileName().toString()));
    }

    /**
     * Resolves a given path to ensure it exists, removing the file extension if necessary.
     * @param path The Path to resolve.
     * @return The resolved Path.
     * @throws FileNotFoundException if no file or folder exists with that name.
     */
    private Path resolve(Path path) throws FileNotFoundException {
        if (!Files.exists(path)) path = getDirectory(path);
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
        return new FileInputStream(getFunction(location).toFile());
    }

    /**
     * Writes content to a specific mcfunction file in the pack.
     * @param location The ResourceLocation of the mcfunction file.
     * @param content The InputStream containing the content to write.
     * @throws FileNotFoundException if the path is invalid.
     * @throws IOException if an I/O error occurs while writing to the file.
     */
    public void put(ResourceLocation location, InputStream content) throws IOException {
        Path path = getFunction(location);
        FileUtil.createDirectoriesSafe(path.getParent());
        try (OutputStream out = new FileOutputStream(path.toFile())) {
            content.transferTo(out);
        }
    }

    /**
     * Deletes a specific mcfunction file from the pack.
     * @param location The ResourceLocation of the mcfunction file to delete.
     * @throws IOException if the file does not exist, the path is invalid, or an I/O error occurs while deleting the file.
     */
    public void delete(ResourceLocation location) throws IOException {
        Path path = resolve(getFunction(location));
        if (!FileUtils.deleteQuietly(path.toFile())) throw new IOException("Failed to delete file: " + path);
        deleteEmptyDirectories(path);
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
        Path sourcePath = resolve(getFunction(source));
        Path destinationPath = sourcePath.toFile().isDirectory() ? getDirectory(destination) : getFunction(destination);

        FileUtil.createDirectoriesSafe(destinationPath.getParent());
        consumer.accept(sourcePath, destinationPath);
        deleteEmptyDirectories(sourcePath);
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

    @FunctionalInterface
    private interface IOBiConsumer<T, U> {
        void accept(T t, U u) throws IOException;
    }
}
