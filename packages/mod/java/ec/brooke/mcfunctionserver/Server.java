package ec.brooke.mcfunctionserver;

import io.javalin.Javalin;
import io.javalin.http.Context;
import net.minecraft.resources.ResourceLocation;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

import static io.javalin.apibuilder.ApiBuilder.*;

public class Server {
    private final PackAccessor accessor;

    public Server(PackAccessor accessor) {
        this.accessor = accessor;
    }

    public void run() {
        Javalin.create(config -> {
            config.useVirtualThreads = true;
            config.http.asyncTimeout = 10_000L;
            config.showJavalinBanner = false;
            config.staticFiles.add("/public");
            config.router.apiBuilder(() -> {
                path("/api", () -> {
                    get("/index", this::index);
                    path("/file/<path>", () -> {
                        get(this::read);
                        put(this::write);
                        delete(this::remove);
                    });
                });
            });
        }).start(Mod.CONFIG.address.getHostString(), Mod.CONFIG.address.getPort());
    }

    private void index(Context ctx) {
        ctx.json(accessor.index().stream()
                .filter(l -> l.getNamespace().equals(Mod.CONFIG.namespace))
                .map(ResourceLocation::getPath).toList()
        );
    }

    private ResourceLocation parsePath(Context ctx) {
        return ResourceLocation.fromNamespaceAndPath(Mod.CONFIG.namespace, ctx.pathParam("path"));
    }

    private void read(Context ctx) {
        try { ctx.result(accessor.get(parsePath(ctx))).contentType("text/mcfunction"); }
        catch (FileNotFoundException ignored) { ctx.status(404); }
    }

    private void write(Context ctx) throws IOException {
        try {
            accessor.put(parsePath(ctx), ctx.bodyInputStream());
            ctx.status(201);
        }
        catch (FileNotFoundException ignored) { ctx.status(403); }
    }

    private void remove(Context ctx) throws IOException {
        try {
            accessor.delete(parsePath(ctx));
            ctx.status(204);
        } catch (FileNotFoundException ignored) { ctx.status(404); }
    }
}
