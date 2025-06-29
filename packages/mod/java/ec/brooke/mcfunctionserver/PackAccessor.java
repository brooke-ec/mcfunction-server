package ec.brooke.mcfunctionserver;

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

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

/**
 * Wrapper for accessing and managing a datapack's mcfunction files.
 */
public class PackAccessor {
    public static final String DATA_DIR = "data";
    private final Path root;

    public PackAccessor(Path root) {
        this.root = root;
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
     * @throws IOException if an I/O error occurs while reading the pack resources.
     */
    public ResourceLocation[] index() throws IOException {
        PackLocationInfo location = new PackLocationInfo("", Component.empty(), PackSource.WORLD, Optional.empty());
        try (
                PathPackResources resources = new PathPackResources(location, root);
                MultiPackResourceManager manager = new MultiPackResourceManager(PackType.SERVER_DATA, List.of(resources));
        ) {
            return ServerFunctionLibrary.LISTER.listMatchingResources(manager).keySet().stream().map(ServerFunctionLibrary.LISTER::fileToId).toArray(ResourceLocation[]::new);
        }
    }

    /**
     * Retrieves the path to a specific mcfunction file in the pack.
     * @param location The ResourceLocation of the mcfunction file.
     * @return The Path to the mcfunction file.
     */
    public Path getPath(ResourceLocation location) {
        ResourceLocation file = ServerFunctionLibrary.LISTER.idToFile(location);
        return root.resolve(DATA_DIR).resolve(file.getNamespace()).resolve(file.getPath());
    }
}
