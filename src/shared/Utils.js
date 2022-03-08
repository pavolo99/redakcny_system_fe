export function getFullName(userDto) {
    if (!userDto) {
        return '';
    }
    return userDto.firstName + ' ' + userDto.lastName;
}

export function getUserValue(userDto) {
    if (!userDto) {
        return '';
    }
    return userDto.firstName + userDto.lastName + userDto.id + userDto.email;
}

export function getUsernameWithFullName(userDto) {
    if (!userDto) {
        return '';
    }
    return userDto.username + ' (' + userDto.firstName + ' ' + userDto.lastName + ')';
}

export function getUser(userDto) {
    if (!userDto) {
        return '';
    }
    if (userDto.email) {
        return userDto.firstName + ' ' + userDto.lastName + ', ' + userDto.email + ', ' + userDto.username;
    } else {
        return userDto.firstName + ' ' + userDto.lastName + ', ' + userDto.username;
    }
}

export function generateHSLColorBasedOnUserInfo(userValue) {
    if (!userValue) {
        return '';
    }
    let hash = 0;
    for (let i = 0; i < userValue.length; i++) {
        hash = userValue.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = hash % 360;
    return 'hsl(' + h + ', ' + 70 + '%, ' + 47 + '%)';
}

export function convertTimestampToDate(timeStamp) {
    if (!timeStamp) {
        return '';
    }
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

export function articleCanBeEdited(articleStatus) {
    return articleStatus === 'WRITING' || articleStatus === 'IN_REVIEW' || articleStatus === 'APPROVED';
}

export function handle401Error(error, history) {
    if (error.response.status === 401) {
        history.push('/login');
        localStorage.clear();
    }
}
