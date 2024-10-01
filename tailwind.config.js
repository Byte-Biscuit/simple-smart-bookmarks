/** @type {import("tailwindcss").Config} */
module.exports = {
    mode: "jit",
    darkMode: "class",
    content: ["./src/newtab/**/*.tsx", "./src/*.tsx", "./src/util/**/*.tsx"],
    theme: {
        extend: {
            colors: {
                scrollbar: {
                    track: "#f1f1f1",
                    thumb: "#888",
                    hover: "#555"
                }
            }
        }
    },
    plugins: [],
    corePlugins: {
        preflight: false
    }
}
