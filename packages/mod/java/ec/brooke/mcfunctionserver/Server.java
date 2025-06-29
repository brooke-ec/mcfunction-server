package ec.brooke.mcfunctionserver;

import io.javalin.Javalin;
import io.javalin.http.Context;

import java.io.IOException;

import static io.javalin.apibuilder.ApiBuilder.*;

public class Server {
    private final PackAccessor packAccessor;
    private Javalin javalin;

    public Server(PackAccessor packAccessor) {
        this.packAccessor = packAccessor;
    }

    public void run() {
        javalin = Javalin.create(config -> {
            config.useVirtualThreads = true;
            config.http.asyncTimeout = 10_000L;
            config.showJavalinBanner = false;
            config.staticFiles.add("/public");
            config.router.apiBuilder(() -> {
                path("/api", () -> {
                    get("/index", this::index);
                });
            });
        }).start(7070);
    }

    private void index(Context ctx) throws IOException {
        ctx.json(packAccessor.index());
    }
}
