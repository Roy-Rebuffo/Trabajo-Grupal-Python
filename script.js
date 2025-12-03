// JavaScript function to call a Python function


async function callPython() {
    // Access the 'pywebview' object which bridges JS and Python
    // 'pywebview.api' exposes the Python functions defined in the API
    const response = await pywebview.api.say_hello_from_python('JavaScript');
   console.log(response);
}

// When the window is loaded, expose the JavaScript function to Python
// This makes 'updateMessage' available for Python to call
window.addEventListener('pywebviewready', function () {

    console.log("pywebview:", pywebview);
    console.log("apis disponibles:", Object.keys(pywebview.api));

    // Now it exists:
    pywebview.api.init_js_ready();
},{once: true});


