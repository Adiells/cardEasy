function showToast(message, isError = false) {
    const toast = document.getElementById('toast')
    const toastMessage = document.getElementById('toast-message')
    
    // Configura a mensagem e cor
    toastMessage.textContent = message
    toast.style.background = isError ? '#ff3333' : '#FF7A33'
    
    // Mostra o toast
    toast.classList.add('show')
    
    // Esconde após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show')
    }, 3000)
}