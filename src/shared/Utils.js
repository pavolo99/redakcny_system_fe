export function getFullName(userDto) {
    return userDto.firstName + ' ' + userDto.lastName;
}

export function getUserValue(userDto) {
    return userDto.firstName + userDto.lastName + userDto.email + userDto.username + userDto.id;
}

export function getUsernameWithFullName(userDto) {
    return userDto.username + ' (' + userDto.firstName + ' ' + userDto.lastName + ')';
}

export function getUser(userDto) {
    return userDto.firstName + ' ' + userDto.lastName + ', ' + userDto.email + ', ' + userDto.username;
}

export function generateColorBasedOnUser(userValue) {
    let hash = 0;
    for (let i = 0; i < userValue.length; i++) {
        hash = userValue.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = hash % 360;
    return 'hsl(' + h + ', ' + 70 + '%, ' + 47 + '%)';
}
