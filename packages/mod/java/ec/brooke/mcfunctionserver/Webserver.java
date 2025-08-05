package ec.brooke.mcfunctionserver;

import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;
import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.UnauthorizedResponse;
import net.fabricmc.loader.api.metadata.Person;
import net.minecraft.ResourceLocationException;
import net.minecraft.resources.ResourceLocation;
import org.jetbrains.annotations.Nullable;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Stream;

import static io.javalin.apibuilder.ApiBuilder.*;

public class Webserver {
    public static final String MOVE_COMMAND = "MOVE ";
    public static final String COPY_COMMAND = "COPY ";

    public static final String SESSION_UUID = "UUID";

    private static final Base64.Encoder base64 = Base64.getUrlEncoder();
    private static final SecureRandom random = new SecureRandom();
    private final BiMap<String, UUID> tokens = HashBiMap.create();
    private final PackAccessor accessor;

    public Webserver(PackAccessor accessor) {
        this.accessor = accessor;
    }

    public void run() {
        Javalin.create(config -> {
            config.useVirtualThreads = true;
            config.http.asyncTimeout = 10_000L;
            config.showJavalinBanner = false;
            config.staticFiles.add("/public");
            config.router.apiBuilder(() -> {
                        get("/login/<token>", this::login);
                        get("/logout", this::logout);
                        get("/info", this::info);
                        path("/api", () -> {
                                    get("/index", this::index);
                                    path("/file/<path>", () -> {
                                        get(this::read);
                                        put(this::write);
                                        delete(this::remove);
                                        patch(this::transfer);
                                    });
                                }
                        );
                    }
            );
        }).before("/api/*", this::protect)
        .start(Mod.CONFIG.address.getHostString(), Mod.CONFIG.address.getPort());
    }

    private void info(Context ctx) {
        ctx.json(new SessionInfo(
                Mod.METADATA.getContributors().stream().map(Person::getName).toArray(String[]::new),
                Mod.METADATA.getVersion().getFriendlyString(),
                ctx.sessionAttribute(SESSION_UUID),
                Mod.CONFIG.namespace,
                Mod.CONFIG.homepage,
                Mod.CONFIG.titleName
        ));
    }

    /**
     * Generates a new token for the given UUID.
     *
     * @param uuid The UUID to generate a token for.
     * @return A base64 encoded token string.
     */
    public String generateToken(UUID uuid) {
        byte[] bytes = new byte[24];
        random.nextBytes(bytes);
        String token = base64.encodeToString(bytes);
        synchronized (tokens) { tokens.inverse().put(uuid, token); }
        return token;
    }

    private void protect(Context ctx) {
        if (ctx.sessionAttribute(SESSION_UUID) == null) throw new UnauthorizedResponse("Please authenticate first");
    }

    private void login(Context ctx) {
        String token = ctx.pathParam("token");

        UUID uuid;
        synchronized (tokens) { uuid = tokens.remove(token); }

        if (uuid != null) {
            if (ctx.req().getSession() != null) ctx.req().changeSessionId();
            ctx.sessionAttribute(SESSION_UUID, uuid);
            ctx.redirect("/");
        } else if (ctx.sessionAttributeMap().containsKey(SESSION_UUID)) ctx.redirect("/");
        else ctx.redirect("/");
    }

    private void logout(Context ctx) {
        ctx.req().getSession().invalidate();
        ctx.redirect("/");
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
        try {
            return ResourceLocation.fromNamespaceAndPath(Mod.CONFIG.namespace, string);
        } catch (ResourceLocationException e) {
            throw new BadRequestResponse("Invalid resource location: " + string);
        }
    }

    private void read(Context ctx) {
        try {
            ctx.result(accessor.get(parsePath(ctx))).contentType("text/mcfunction");
        } catch (FileNotFoundException e) {
            throw new NotFoundResponse("File not found");
        }
    }

    private void write(Context ctx) throws IOException {
        accessor.put(parsePath(ctx), ctx.bodyInputStream());
        ctx.status(201);
    }

    private void remove(Context ctx) throws IOException {
        try {
            accessor.delete(parsePath(ctx));
            ctx.status(204);
        } catch (FileNotFoundException ignored) {
            throw new NotFoundResponse("File not found");
        }
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
        } catch (FileNotFoundException ignored) {
            throw new NotFoundResponse("File not found");
        } catch (NoSuchElementException ignored) {
            throw new BadRequestResponse("Invalid PATCH command");
        }
    }

    private record SessionInfo(
            String[] contributors,
            String version,
            @Nullable UUID uuid,
            String namespace,
            ModConfig.CustomLink homepage,
            String title
    ) {}
}
