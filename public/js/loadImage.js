const changePhotoButton = document.querySelector('.change-photo-btn');
const photoModal = document.getElementById('photo-modal');
const closeModalButton = document.querySelector('.photo-modal-close-btn');
const modalChoosePhotoButton = document.getElementById('modal-choose-photo-btn');
const modalSavePhotoButton = document.getElementById('modal-save-photo-btn');
const modalCancelButton = document.getElementById('modal-cancel-btn');
const hiddenPhotoInput = document.getElementById('foto'); 
const modalPreviewImage = document.getElementById('modal-preview-image');
const modalNoPreviewText = document.getElementById('modal-no-preview-text');
const mainProfilePicture = document.getElementById('profile-picture');
const form = document.getElementById('photo-upload-form')

let originalProfilePicSrc = mainProfilePicture.src; // Salva o src original
let selectedFile = null;

// Abrir o modal
changePhotoButton.addEventListener('click', () => {
    originalProfilePicSrc = mainProfilePicture.src; // Atualiza o src original ao abrir
    selectedFile = null; // Reseta o arquivo selecionado
    modalPreviewImage.style.display = 'none';
    modalPreviewImage.src = '#';
    modalNoPreviewText.style.display = 'block';
    modalSavePhotoButton.disabled = true;
    photoModal.style.display = 'flex';
});

// Fechar o modal pelo botão 'X'
closeModalButton.addEventListener('click', () => {
    photoModal.style.display = 'none';
    // Restaura a imagem de perfil original se nada foi salvo
    mainProfilePicture.src = originalProfilePicSrc;
});

// Fechar o modal pelo botão 'Cancelar'
modalCancelButton.addEventListener('click', () => {
    photoModal.style.display = 'none';
    // Restaura a imagem de perfil original
    mainProfilePicture.src = originalProfilePicSrc;
});

// Clicar no botão 'Escolher Arquivo' dentro do modal dispara o input de arquivo escondido
modalChoosePhotoButton.addEventListener('click', () => {
    hiddenPhotoInput.click();
});

// Quando um arquivo é selecionado no input escondido
hiddenPhotoInput.addEventListener('change', function(event) {
    selectedFile = event.target.files[0];
    if (selectedFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            modalPreviewImage.src = e.target.result;
            modalPreviewImage.style.display = 'block';
            modalNoPreviewText.style.display = 'none';
            modalSavePhotoButton.disabled = false; // Habilita o botão de salvar

            // Opcional: Atualizar a imagem de perfil principal em tempo real para preview
            // mainProfilePicture.src = e.target.result;
        }
        reader.readAsDataURL(selectedFile);
    } else {
        modalPreviewImage.style.display = 'none';
        modalPreviewImage.src = '#';
        modalNoPreviewText.style.display = 'block';
        modalSavePhotoButton.disabled = true;
        selectedFile = null;
    }
});

// Salvar a foto
modalSavePhotoButton.addEventListener('click', () => {
    if (selectedFile && modalPreviewImage.src !== '#') {
        // Atualiza a imagem de perfil principal permanentemente (visualmente)
        mainProfilePicture.src = modalPreviewImage.src;
        originalProfilePicSrc = modalPreviewImage.src; // Atualiza o src original para o novo
        const body = new FormData();
        body.append('foto', selectedFile);
    } else {
        alert('Nenhuma imagem selecionada para salvar.');
    }
});
processFormRequest(form, '/api/perfil/foto', 'Sucesso ao editar foto', [], true)

// Fechar o modal se clicar fora do conteúdo (no backdrop)
window.addEventListener('click', (event) => {
    if (event.target === photoModal) {
        photoModal.style.display = 'none';
        // Restaura a imagem de perfil original se nada foi salvo
        mainProfilePicture.src = originalProfilePicSrc;
    }
});

// Limpar o valor do input de arquivo para permitir selecionar o mesmo arquivo novamente
// após cancelar uma seleção ou fechar o modal.
hiddenPhotoInput.addEventListener('click', function() {
    this.value = null;
});