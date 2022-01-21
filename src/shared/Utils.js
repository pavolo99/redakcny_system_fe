export function getFullName(userDto) {
    return userDto.firstName + ' ' + userDto.lastName;
}

export function getUserValue(userDto) {
    return userDto.firstName + userDto.lastName + userDto.id;
}

export function getUsernameWithFullName(userDto) {
    return userDto.username + ' (' + userDto.firstName + ' ' + userDto.lastName + ')';
}

export function getUser(userDto) {
    return userDto.firstName + ' ' + userDto.lastName + ', ' + userDto.email + ', ' + userDto.username;
}

export function generateHSLColorBasedOnUserInfo(userValue) {
    let hash = 0;
    for (let i = 0; i < userValue.length; i++) {
        hash = userValue.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = hash % 360;
    return 'hsl(' + h + ', ' + 70 + '%, ' + 47 + '%)';
}

export function convertTimestampToDate(timeStamp) {
    const date = new Date(timeStamp);
    const currentDate = new Date();
    if (currentDate.getDate() === date.getDate()
        && currentDate.getMonth() === date.getMonth()
        && currentDate.getFullYear() === date.getFullYear()) {
        return 'Dnes o ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    return date.getDate() + '.' + (date.getMonth() + 1) + '.'
        + date.getFullYear() + ' ' + date.getHours() + ':'
        + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
}
