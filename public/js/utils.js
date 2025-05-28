function validatePassword() {
    // Lembrar que sempre que utilizar essa função, definir um id para small, e sempre usar os mesmos ids para o campo de senha, e alem disso, tembem se deve recriar os css, js que eu nao fiz global só para isso.
    const passwordValue = fieldPass.value
    const confirmPasswordValue = fieldConfirmPass.value


    const isLongEnough = passwordValue.length >= 8
    const hasNoSpaces = !passwordValue.includes(' ')
    const hasNumber = /\d/.test(passwordValue)
    const hasLetter = /[a-zA-Z]/.test(passwordValue)

    const isMainPasswordValid = isLongEnough && hasNoSpaces && hasNumber && hasLetter

    if (passwordValue.length === 0) {
        passwordHelpText.textContent = defaultPasswordHelpMessage
        passwordHelpText.className = ''
        fieldPass.classList.remove('validPass', 'invalidPass')
    } else {
        let errorMessage = ""
        passwordHelpText.className = 'text-danger'

        if (!isLongEnough) {
            errorMessage = "A senha deve ter no mínimo 8 caracteres."
        } else if (!hasNoSpaces) {
            errorMessage = "A senha não pode conter espaços."
        } else if (!hasLetter) {
            errorMessage = "A senha precisa conter pelo menos uma letra."
        } else if (!hasNumber) {
            errorMessage = "A senha precisa conter pelo menos um número."
        }
        else if (isMainPasswordValid) {
            passwordHelpText.textContent = "Tudo ok!"
            passwordHelpText.className = 'text-success';
        }
        if (errorMessage) {
            passwordHelpText.textContent = errorMessage
        }

        if (isMainPasswordValid) {
            fieldPass.classList.add('validPass')
            fieldPass.classList.remove('invalidPass')
        } else {
            fieldPass.classList.remove('validPass')
            fieldPass.classList.add('invalidPass')
        }
    }


    let passwordsDoMatch = false
    if (confirmPasswordValue.length > 0) {
        if (passwordValue === confirmPasswordValue) {
            passwordsDoMatch = true
            fieldConfirmPass.classList.add('validPass')
            fieldConfirmPass.classList.remove('notEqual')
        } else {
            fieldConfirmPass.classList.remove('validPass')
            fieldConfirmPass.classList.add('notEqual')
        }
    } else {
        fieldConfirmPass.classList.remove('validPass')
        fieldConfirmPass.classList.remove('notEqual')
    }

    if (isMainPasswordValid && confirmPasswordValue.length > 0 && passwordsDoMatch) {
        return true
    }else{
        return false
    }
}
async function validateUsername() {
    button.disabled = true
    let currentValue = fieldUsername.value;
    if (currentValue.includes(' ')) {
        currentValue = currentValue.replace(/\s/g, '');
        fieldUsername.value = currentValue;
    }

    const isValidFormat = /^[a-z0-9._]*$/.test(currentValue);

    if (currentValue.length === 0) {
        usernameHelpText.textContent = defaultUsernameHelpMessage;
        usernameHelpText.className = '';
        fieldUsername.classList.remove('validInput', 'invalidInput');
    } else if (isValidFormat) {
        if (currentValue.length < 3) {
            usernameHelpText.textContent = "Use pelo menos 3 caracteres.";
            usernameHelpText.className = 'text-warning';
            fieldUsername.classList.remove('validInput');
            fieldUsername.classList.add('invalidInput');
            return;
        }
        usernameHelpText.textContent = "Username válido!";
        usernameHelpText.className = 'text-success';
        fieldUsername.classList.remove('invalidInput');
        fieldUsername.classList.add('validInput');
        
        clearTimeout(debounceTimer);
        var promise =  await new Promise((resolve, reject) => {
            debounceTimer = setTimeout(() => {
                fetch(`/api/usuarios/verificar?username=${encodeURIComponent(currentValue)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.disponivel) {
                        usernameHelpText.textContent = "Username disponível!";
                        usernameHelpText.className = 'text-success';
                        fieldUsername.classList.add('validInput');
                        fieldUsername.classList.remove('invalidInput');
                        resolve(true)
                    } else {
                        usernameHelpText.textContent = "Username já está em uso.";
                        usernameHelpText.className = 'text-danger';
                        fieldUsername.classList.remove('validInput');
                        fieldUsername.classList.add('invalidInput');
                        resolve(false)
                    }
                })
                .catch(err => {
                    usernameHelpText.textContent = "Erro ao verificar username.";
                    usernameHelpText.className = 'text-warning';
                    reject(err)
                });
            }, 700);
        })
    } else {
        usernameHelpText.textContent = "Inválido: use apenas minúsculas, números, '.', '_'.";
        usernameHelpText.className = 'text-danger';
        fieldUsername.classList.remove('validInput');
        fieldUsername.classList.add('invalidInput');
    }
    return await promise && isValidFormat && currentValue.length >= 3;
}

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
function processFormRequest(formId, apiRouter, successMessage, fieldNamesArray, multiparty=false){
    formId.addEventListener('submit', evt => {
        evt.preventDefault()
        let body
        let headers = {}
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
            headers['Content-Type'] = 'application/json'
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