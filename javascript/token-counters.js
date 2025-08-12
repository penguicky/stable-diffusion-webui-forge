let promptTokenCountUpdateFunctions = {};

function update_txt2img_tokens(...args) {
    // Called from Gradio - handles variable number of arguments robustly
    update_token_counter("txt2img_token_button");
    update_token_counter("txt2img_negative_token_button");

    // Return the appropriate value based on argument count
    // For 0 args: return empty array
    // For 1 arg: return the single argument
    // For 2+ args: return all arguments as array
    if (args.length === 0) {
        return [];
    } else if (args.length === 1) {
        return args[0];
    } else {
        return args;
    }
}

function update_img2img_tokens(...args) {
    // Called from Gradio - handles variable number of arguments robustly
    update_token_counter("img2img_token_button");
    update_token_counter("img2img_negative_token_button");

    // Return the appropriate value based on argument count
    // For 0 args: return empty array
    // For 1 arg: return the single argument
    // For 2+ args: return all arguments as array
    if (args.length === 0) {
        return [];
    } else if (args.length === 1) {
        return args[0];
    } else {
        return args;
    }
}

function update_token_counter(button_id) {
    try {
        promptTokenCountUpdateFunctions[button_id]?.();
    } catch (error) {
        console.warn(`Token counter update failed for ${button_id}:`, error);
    }
}


function recalculatePromptTokens(name) {
    try {
        promptTokenCountUpdateFunctions[name]?.();
    } catch (error) {
        console.warn(`Prompt token recalculation failed for ${name}:`, error);
    }
}

function recalculate_prompts_txt2img(...args) {
    // Called from Gradio - handles variable number of arguments robustly
    recalculatePromptTokens('txt2img_prompt');
    recalculatePromptTokens('txt2img_neg_prompt');

    // Return arguments in a consistent format
    if (args.length === 0) {
        return [];
    } else if (args.length === 1) {
        return args[0];
    } else {
        return args;
    }
}

function recalculate_prompts_img2img(...args) {
    // Called from Gradio - handles variable number of arguments robustly
    recalculatePromptTokens('img2img_prompt');
    recalculatePromptTokens('img2img_neg_prompt');

    // Return arguments in a consistent format
    if (args.length === 0) {
        return [];
    } else if (args.length === 1) {
        return args[0];
    } else {
        return args;
    }
}

function setupTokenCounting(id, id_counter, id_button) {
    try {
        var prompt = gradioApp().getElementById(id);
        var counter = gradioApp().getElementById(id_counter);
        var textarea = gradioApp().querySelector(`#${id} > label > textarea`);

        // Check if elements exist before proceeding
        if (!prompt || !counter) {
            console.warn(`Token counting setup failed: missing elements for ${id}`);
            return;
        }

        if (counter.parentElement == prompt.parentElement) {
            return;
        }

        prompt.parentElement.insertBefore(counter, prompt);
        prompt.parentElement.style.position = "relative";

        var func = onEdit(id, textarea, 800, function() {
            try {
                if (counter.classList.contains("token-counter-visible")) {
                    gradioApp().getElementById(id_button)?.click();
                }
            } catch (error) {
                console.warn(`Token counter click failed for ${id_button}:`, error);
            }
        });
        promptTokenCountUpdateFunctions[id] = func;
        promptTokenCountUpdateFunctions[id_button] = func;
    } catch (error) {
        console.warn(`Token counting setup failed for ${id}:`, error);
    }
}

function toggleTokenCountingVisibility(id, id_counter, id_button) {
    try {
        var counter = gradioApp().getElementById(id_counter);

        if (!counter) {
            console.warn(`Token counter visibility toggle failed: missing counter element ${id_counter}`);
            return;
        }

        counter.style.display = opts.disable_token_counters ? "none" : "block";
        counter.classList.toggle("token-counter-visible", !opts.disable_token_counters);
    } catch (error) {
        console.warn(`Token counter visibility toggle failed for ${id_counter}:`, error);
    }
}

function runCodeForTokenCounters(fun) {
    fun('txt2img_prompt', 'txt2img_token_counter', 'txt2img_token_button');
    fun('txt2img_neg_prompt', 'txt2img_negative_token_counter', 'txt2img_negative_token_button');
    fun('img2img_prompt', 'img2img_token_counter', 'img2img_token_button');
    fun('img2img_neg_prompt', 'img2img_negative_token_counter', 'img2img_negative_token_button');
}

onUiLoaded(function() {
    runCodeForTokenCounters(setupTokenCounting);
});

onOptionsChanged(function() {
    runCodeForTokenCounters(toggleTokenCountingVisibility);
});
