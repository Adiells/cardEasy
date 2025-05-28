function isPasswordValid(password) {
    const isLongEnough = password.length >= 8;
    const hasNoSpaces = !password.includes(' ');
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    return isLongEnough && hasNoSpaces && hasNumber && hasLetter;
}
function isUsernameValid(name){
    const isValidFormat = /^[a-z0-9._]*$/.test(name)
    return typeof name === 'string' && isValidFormat && name.length >= 3
}
module.exports = { isPasswordValid, isUsernameValid };