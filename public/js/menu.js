document.addEventListener('DOMContentLoaded', function() {
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (hamburgerIcon && dropdownMenu) {
        hamburgerIcon.addEventListener('click', function(event) {
            event.stopPropagation(); // Impede que o clique se propague para o 'window' imediatamente
            const isExpanded = hamburgerIcon.getAttribute('aria-expanded') === 'true' || false;
            hamburgerIcon.setAttribute('aria-expanded', !isExpanded);
            dropdownMenu.classList.toggle('show');
        });

        // Opcional: Fechar o dropdown se o usuário clicar fora dele
        window.addEventListener('click', function(event) {
            // Verifica se o dropdown está visível E se o clique não foi no ícone nem dentro do menu
            if (dropdownMenu.classList.contains('show') && 
                !hamburgerIcon.contains(event.target) && 
                !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.remove('show');
                hamburgerIcon.setAttribute('aria-expanded', 'false');
            }
        });
    }
});