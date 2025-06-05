function processFormRequest(formId, apiRouter, successMessage, fieldNamesArray, multiparty=false){
    formId.addEventListener('submit', evt => {
        console.log('khkflgiodahdgoivhndaioksnfohksdahnfoiheqsn')
        evt.preventDefault()
        let body
        let headers = {}
        if(!multiparty){
            const dataObject = {};
            let form = evt.target
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
            console.log(body)
        }
        fetch(apiRouter, {method: 'POST', body, headers: headers})
            .then(resp => {
                return resp.json()
                .then(json => {
                    if(!resp.ok){
                        throw new Error(json.err || `Erro desconhecido com status ${resp.status}`)
                    }
                    return json
                })
            })
            .then(json => {
                showToast(successMessage)
                if(json.redirect){
                    window.location.href = json.redirect
                }
                formId.reset()
            })
            .catch(err => {
                console.log('Houve um erro', err)
                showToast(`Houve um erro ${err}`, true)
            })
    })
}