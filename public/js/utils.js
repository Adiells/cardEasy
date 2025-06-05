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
