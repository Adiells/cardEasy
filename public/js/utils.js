function validatePassword() {
    // Lembrar que sempre que utilizar essa função, definir um id para small, e sempre usar os mesmos ids para o campo de senha, e alem disso, tembem se deve recriar os css, js que eu nao fiz global só para isso.
    const passwordValue = fieldPass.value;
    const confirmPasswordValue = fieldConfirmPass.value;

    button.disabled = true;

    const isLongEnough = passwordValue.length >= 8;
    const hasNoSpaces = !passwordValue.includes(' ');
    const hasNumber = /\d/.test(passwordValue);
    const hasLetter = /[a-zA-Z]/.test(passwordValue);

    const isMainPasswordValid = isLongEnough && hasNoSpaces && hasNumber && hasLetter;

    if (passwordValue.length === 0) {
        passwordHelpText.textContent = defaultPasswordHelpMessage;
        passwordHelpText.className = '';
        fieldPass.classList.remove('validPass', 'invalidPass');
    } else {
        let errorMessage = ""; 
        passwordHelpText.className = 'text-danger'; 

        if (!isLongEnough) {
            errorMessage = "A senha deve ter no mínimo 8 caracteres.";
        } else if (!hasNoSpaces) {
            errorMessage = "A senha não pode conter espaços.";
        } else if (!hasLetter) {
            errorMessage = "A senha precisa conter pelo menos uma letra.";
        } else if (!hasNumber) {
            errorMessage = "A senha precisa conter pelo menos um número.";
        }
        else if (isMainPasswordValid) {
            passwordHelpText.textContent = "Tudo ok!";
            passwordHelpText.className = 'text-success'; 
        }
        if (errorMessage) {
            passwordHelpText.textContent = errorMessage;
        }

        if (isMainPasswordValid) {
            fieldPass.classList.add('validPass');
            fieldPass.classList.remove('invalidPass');
        } else {
            fieldPass.classList.remove('validPass');
            fieldPass.classList.add('invalidPass');
        }
    }


    let passwordsDoMatch = false;
    if (confirmPasswordValue.length > 0) {
        if (passwordValue === confirmPasswordValue) {
            passwordsDoMatch = true;
            fieldConfirmPass.classList.add('validPass');
            fieldConfirmPass.classList.remove('notEqual');
        } else {
            fieldConfirmPass.classList.remove('validPass');
            fieldConfirmPass.classList.add('notEqual');
        }
    } else {
        fieldConfirmPass.classList.remove('validPass');
        fieldConfirmPass.classList.remove('notEqual');
    }

    if (isMainPasswordValid && confirmPasswordValue.length > 0 && passwordsDoMatch) {
        button.disabled = false;
    }
}
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    // Configura a mensagem e cor
    toastMessage.textContent = message;
    toast.style.background = isError ? '#ff3333' : '#FF7A33';
    
    // Mostra o toast
    toast.classList.add('show');
    
    // Esconde após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
function processFormRequest(formId, apiRouter, successMessage, fieldNamesArray, multiparty=false){
    formId.addEventListener('submit', evt => {
        evt.preventDefault()
        let body
        let headers = {'Content-Type': 'application/json'}
        if(!multiparty){
            const dataObject = {};
            form = evt.target
            if(Array.isArray(fieldNamesArray)){
                fieldNamesArray.forEach(element => {
                    if(form.elements[element]){
                        dataObject[element] = form.elements[element].value;
                    }else{
                        console.log('nao existe', element, 'no form')
                    }
                })
            }
            body = JSON.stringify(dataObject)
            console.log(body)
        }else{
            body = new FormData(evt.target)
        }
        fetch(apiRouter, {method: 'POST', body, headers: headers})
            .then(resp => {
                console.log('chegou na promisse')
                if(!resp.ok){
                    throw new Error(`Request failed with status ${resp.status}`)
                }
                return resp.json()
            })
            .then(json => {
                console.log('teste no utils')
                showToast(successMessage)
                formId.reset()
            })
            .catch(err => {
                console.log('Houve um erro', err)
                showToast(`Houve um erro ${err}`, true)
            })
    })
}