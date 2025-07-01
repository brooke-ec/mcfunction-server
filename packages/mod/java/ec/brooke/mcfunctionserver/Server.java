package ec.brooke.mcfunctionserver;

import io.javalin.Javalin;
import io.javalin.http.Context;
import net.minecraft.ResourceLocationException;
import net.minecraft.resources.ResourceLocation;

import java.io.*;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Stream;

import static io.javalin.apibuilder.ApiBuilder.*;

public class Server {
    private static final String MOVE_COMMAND = "MOVE ";
    private static final String COPY_COMMAND = "COPY ";

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
                        patch(this::transfer);
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
        return parsePath(ctx.pathParam("path"));
    }

    private ResourceLocation parsePath(String string) {
        return ResourceLocation.fromNamespaceAndPath(Mod.CONFIG.namespace, string);
    }

    private void read(Context ctx) {
        try { ctx.result(accessor.get(parsePath(ctx))).contentType("text/mcfunction"); }
        catch (FileNotFoundException ignored) { ctx.status(404); }
        catch (ResourceLocationException ignored) { ctx.status(400); }
    }

    private void write(Context ctx) throws IOException {
        try {
            accessor.put(parsePath(ctx), ctx.bodyInputStream());
            ctx.status(201);
        }
        catch (FileNotFoundException ignored) { ctx.status(403); }
        catch (ResourceLocationException ignored) { ctx.status(400); }
    }

    private void remove(Context ctx) throws IOException {
        try {
            accessor.delete(parsePath(ctx));
            ctx.status(204);
        }
        catch (FileNotFoundException ignored) { ctx.status(404); }
        catch (ResourceLocationException ignored) { ctx.status(400); }
    }

    private void transfer(Context ctx) throws IOException {
        try {
            String body = ctx.body();
            String command = Stream.of(MOVE_COMMAND, COPY_COMMAND)
                    .sorted(Comparator.comparingInt(String::length))
                    .filter(body::startsWith).findFirst().orElseThrow();

            ResourceLocation source = parsePath(body.substring(command.length()).trim());
            ResourceLocation destination = parsePath(ctx);

            if (command.equals(MOVE_COMMAND)) accessor.move(source, destination);
            else if (command.equals(COPY_COMMAND)) accessor.copy(source, destination);
            ctx.status(201);
        }
        catch (FileNotFoundException ignored) { ctx.status(404); }
        catch (NoSuchElementException | ResourceLocationException ignored) { ctx.status(400); }
    }
}
