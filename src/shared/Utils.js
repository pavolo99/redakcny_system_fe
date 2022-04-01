export function getFullName(userDto) {
    if (!userDto) {
        return '';
    }
    return userDto.fullName ? userDto.fullName : userDto.username;
}

export function getUserValue(userDto) {
    if (!userDto) {
        return '';
    }
    return userDto.fullName + userDto.id + userDto.email + userDto.authProvider;
}

export function getUsernameWithFullName(userDto, loggedUserId) {
    if (!userDto) {
        return '';
    }
    const loggedUserFullName = loggedUserId === userDto.id ? ' (Vy)' : (userDto.fullName ? ' (' + userDto.fullName + ')' : '')
    return userDto.username + loggedUserFullName;
}

export function getUser(userDto) {
    if (!userDto) {
        return '';
    }
    if (userDto.fullName) {
        if (userDto.email) {
            return userDto.fullName + ' (' + userDto.email + ')';
        } else {
            return userDto.fullName;
        }
    } else {
        return userDto.username
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
