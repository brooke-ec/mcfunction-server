package ec.brooke.mcfunctionserver.mixin;

import ec.brooke.mcfunctionserver.Mod;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.commands.functions.CommandFunction;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.server.ServerFunctionLibrary;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Mixin(ServerFunctionLibrary.class)
public class ServerFunctionLibraryMixin {

    @Inject(method = "getFunction", at = @At(value = "HEAD"), cancellable = true)
    private void injectGetFunction(ResourceLocation resourceLocation, CallbackInfoReturnable<Optional<CommandFunction<CommandSourceStack>>> cir) {
        if (resourceLocation.getNamespace().equals(Mod.CONFIG.namespace))
            cir.setReturnValue(Mod.webserver.accessor.getFunction(resourceLocation));
    }

    @Inject(method = "getFunctions", at = @At(value = "RETURN"), cancellable = true)
    private void injectGetFunctions(CallbackInfoReturnable<Map<ResourceLocation, CommandFunction<CommandSourceStack>>> cir) {
        Map<ResourceLocation, CommandFunction<CommandSourceStack>> result = cir.getReturnValue().entrySet().stream()
                .filter(f -> !f.getKey().getNamespace().equals(Mod.CONFIG.namespace))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        result.putAll(Mod.webserver.accessor.getFunctions());
        cir.setReturnValue(result);
    }

}
