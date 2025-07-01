package ec.brooke.mcfunctionserver;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParseException;
import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;
import net.fabricmc.loader.api.FabricLoader;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class ModConfig {

    /** The namespace used for scoping functions */
    public String namespace = "editor";

    /** The host for the webserver to listen on */
    public InetSocketAddress address = new InetSocketAddress("0.0.0.0", 7070);

    /**
     * Load the configuration file or the default
     * @return The loaded configuration file
     */
    public static ModConfig load() {
        Path path = FabricLoader.getInstance().getConfigDir().resolve(Mod.MOD_ID + ".json");
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(InetSocketAddress.class, new InetSocketAddressAdapter())
                .disableHtmlEscaping()
                .setPrettyPrinting()
                .create();

        ModConfig instance;

        // Load config file if it exists
        if (!Files.exists(path)) instance = new ModConfig();
        else try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            instance = gson.fromJson(reader, ModConfig.class);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        // Write config file to disk in case any updates
        try (BufferedWriter writer = Files.newBufferedWriter(path, StandardCharsets.UTF_8)) {
            gson.toJson(instance, writer);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return instance;
    }

    /**
     * Adapter for serializing and deserializing InetSocketAddress objects
     */
    private static class InetSocketAddressAdapter extends TypeAdapter<InetSocketAddress> {
        @Override
        public void write(JsonWriter out, InetSocketAddress value) throws IOException {
            out.value(value.getHostString() + ":" + value.getPort());
        }

        @Override
        public InetSocketAddress read(JsonReader in) throws IOException {
            String[] split = in.nextString().split(":");
            if (split.length != 2) throw new JsonParseException("Invalid InetSocketAddress format");
            return new InetSocketAddress(split[0], Integer.parseInt(split[1]));
        }
    }

}
