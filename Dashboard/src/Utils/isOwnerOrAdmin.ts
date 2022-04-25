/**
 * @description checks of a user is the owner or admin of a project
 * @param {string} userId the id of the user
 * @param {object} project the project
 */

import ObjectID from 'Common/Types/ObjectID';

const isOwnerOrAdmin: Function = (
    userId: ObjectID,
    project: $TSFixMe
): void => {
    const currentUser: $TSFixMe =
        project &&
        project.users.filter((user: $TSFixMe) => {
            return String(user.userId) === String(userId);
        });

    return currentUser &&
        currentUser.length > 0 &&
        currentUser[0] &&
        currentUser[0].role &&
        (currentUser[0].role === 'Owner' ||
            currentUser[0].role === 'Administrator')
        ? true
        : false;
};

export default isOwnerOrAdmin;