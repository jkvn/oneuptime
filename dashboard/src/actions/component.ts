import BackendAPI from 'common-ui/src/utils/api/backend';
import { Dispatch } from 'redux';
import * as types from '../constants/component';
import ErrorPayload from 'common-ui/src/payload-types/error';
import PositiveNumber from 'common/types/PositiveNumber';
export const showDeleteModal = () => {
    return {
        type: types.SHOW_DELETE_MODAL,
    };
};

export const hideDeleteModal = () => {
    return {
        type: types.HIDE_DELETE_MODAL,
    };
};

// Component list
// props -> {name: '', type, data -> { data.url}}
export const fetchComponents = ({
    projectId,
    skip = 0,
    limit = 3,
}: $TSFixMe) => {
    return function (dispatch: Dispatch) {
        const promise = BackendAPI.get(
            `component/${projectId}?skip=${skip}&limit=${limit}`
        );
        dispatch(fetchComponentsRequest());

        promise.then(
            function (components) {
                dispatch(fetchComponentsSuccess(components.data));
            },
            function (error) {
                dispatch(fetchComponentsFailure(error));
            }
        );

        return promise;
    };
};

export const fetchComponentsSuccess = (components: $TSFixMe) => {
    return {
        type: types.FETCH_COMPONENTS_SUCCESS,
        payload: components,
    };
};

export const fetchComponentsRequest = () => {
    return {
        type: types.FETCH_COMPONENTS_REQUEST,
    };
};

export const fetchComponentsFailure = (error: ErrorPayload) => {
    return {
        type: types.FETCH_COMPONENTS_FAILURE,
        payload: error,
    };
};

export const resetFetchComponents = () => {
    return {
        type: types.FETCH_COMPONENTS_RESET,
    };
};

// Component list
// props -> {name: '', type, data -> { data.url}}
export function fetchPaginatedComponents({
    projectId,
    skip = 0,
    limit = 3,
}: $TSFixMe) {
    return function (dispatch: Dispatch) {
        const promise = BackendAPI.get(
            `component/${projectId}/paginated?skip=${skip}&limit=${limit}`
        );
        dispatch(fetchPaginatedComponentsRequest(projectId));

        promise.then(
            function (response) {
                dispatch(fetchPaginatedComponentsSuccess(response.data));
            },
            function (error) {
                dispatch(fetchPaginatedComponentsFailure(error, projectId));
            }
        );

        return promise;
    };
}

export const fetchPaginatedComponentsSuccess = (payload: $TSFixMe) => {
    return {
        type: types.FETCH_PAGINATED_COMPONENTS_SUCCESS,
        payload,
    };
};

export const fetchPaginatedComponentsRequest = (projectId: $TSFixMe) => {
    return {
        type: types.FETCH_PAGINATED_COMPONENTS_REQUEST,
        payload: projectId,
    };
};

export function fetchPaginatedComponentsFailure(
    error: ErrorPayload,
    projectId: $TSFixMe
) {
    return {
        type: types.FETCH_PAGINATED_COMPONENTS_FAILURE,
        payload: { error, projectId },
    };
}

export const createComponent = (projectId: $TSFixMe, values: $TSFixMe) => {
    values.projectId = values.projectId._id || values.projectId;
    return function (dispatch: Dispatch) {
        const promise = BackendAPI.post(`component/${projectId}`, values);
        dispatch(createComponentRequest());

        promise.then(
            function (component) {
                dispatch(createComponentSuccess(component.data));
            },
            function (error) {
                if (error && error.response && error.response.data) {
                    error = error.response.data;
                }
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(createComponentFailure(error));
            }
        );

        return promise;
    };
};

export const createComponentSuccess = (newComponent: $TSFixMe) => {
    return {
        type: types.CREATE_COMPONENT_SUCCESS,
        payload: newComponent,
    };
};

export const createComponentRequest = () => {
    return {
        type: types.CREATE_COMPONENT_REQUEST,
    };
};

export const createComponentFailure = (error: ErrorPayload) => {
    return {
        type: types.CREATE_COMPONENT_FAILURE,
        payload: error,
    };
};

export const resetCreateComponent = () => {
    return {
        type: types.CREATE_COMPONENT_RESET,
    };
};

export const editComponent = (projectId: $TSFixMe, values: $TSFixMe) => {
    values.projectId = values.projectId._id || values.projectId;

    return function (dispatch: Dispatch) {
        const promise = BackendAPI.put(
            `component/${projectId}/${values._id}`,
            values
        );
        dispatch(editComponentRequest());

        promise.then(
            function (component) {
                dispatch(editComponentSuccess(component.data));
            },
            function (error) {
                if (error && error.response && error.response.data) {
                    error = error.response.data;
                }
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(editComponentFailure(error));
            }
        );

        return promise;
    };
};

export const editComponentSuccess = (newComponent: $TSFixMe) => {
    return {
        type: types.EDIT_COMPONENT_SUCCESS,
        payload: newComponent,
    };
};

export const editComponentRequest = () => {
    return {
        type: types.EDIT_COMPONENT_REQUEST,
    };
};

export const editComponentFailure = (error: ErrorPayload) => {
    return {
        type: types.EDIT_COMPONENT_FAILURE,
        payload: error,
    };
};

export const editComponentSwitch = (index: $TSFixMe) => {
    return {
        type: types.EDIT_COMPONENT_SWITCH,
        payload: index,
    };
};

export const resetEditComponent = () => {
    return {
        type: types.EDIT_COMPONENT_RESET,
    };
};

// Delete a component
// props -> {name: '', type, data -> { data.url}}
export const deleteComponent = (componentId: $TSFixMe, projectId: $TSFixMe) => {
    return function (dispatch: Dispatch) {
        const promise = delete (`component/${projectId}/${componentId}`,
        {
            componentId,
        });
        dispatch(deleteComponentRequest(componentId));

        promise.then(
            function (component) {
                dispatch(deleteComponentSuccess(component.data._id));
            },
            function (error) {
                dispatch(
                    deleteComponentFailure({
                        error: error,
                        componentId,
                    })
                );
            }
        );

        return promise;
    };
};

export const deleteComponentSuccess = (removedComponentId: $TSFixMe) => {
    return {
        type: types.DELETE_COMPONENT_SUCCESS,
        payload: removedComponentId,
    };
};

export const deleteComponentRequest = (componentId: $TSFixMe) => {
    return {
        type: types.DELETE_COMPONENT_REQUEST,
        payload: componentId,
    };
};

export const deleteComponentFailure = (error: ErrorPayload) => {
    return {
        type: types.DELETE_COMPONENT_FAILURE,
        payload: error,
    };
};

export const deleteProjectComponents = (projectId: $TSFixMe) => {
    return {
        type: types.DELETE_PROJECT_COMPONENTS,
        payload: projectId,
    };
};

export const addSeat = (projectId: $TSFixMe) => {
    return function (dispatch: Dispatch) {
        const promise = BackendAPI.post(`component/${projectId}/addseat`, {});
        dispatch(addSeatRequest());

        promise.then(
            function (component) {
                dispatch(createComponentFailure(component.data));

                dispatch(addSeatSuccess(component.data));
            },
            function (error) {
                if (error && error.response && error.response.data) {
                    error = error.response.data;
                }
                if (error && error.data) {
                    error = error.data;
                }
                if (error && error.message) {
                    error = error.message;
                } else {
                    error = 'Network Error';
                }
                dispatch(addSeatFailure(error));
            }
        );

        return promise;
    };
};

export const addSeatSuccess = (message: $TSFixMe) => {
    return {
        type: types.ADD_SEAT_SUCCESS,
        payload: message,
    };
};

export const addSeatRequest = () => {
    return {
        type: types.ADD_SEAT_REQUEST,
    };
};

export const addSeatFailure = (error: ErrorPayload) => {
    return {
        type: types.ADD_SEAT_FAILURE,
        payload: error,
    };
};

export const addSeatReset = () => {
    return {
        type: types.ADD_SEAT_RESET,
    };
};

// Component Resources list
// props -> {name: '', type, data -> { data.url}}
export function fetchComponentResources(
    projectId: $TSFixMe,
    componentId: $TSFixMe,
    skip: PositiveNumber,
    limit: PositiveNumber
) {
    return function (dispatch: Dispatch) {
        const promise = BackendAPI.get(
            `component/${projectId}/resources/${componentId}?skip=${skip}&limit=${limit}`
        );
        dispatch(fetchComponentResourcesRequest(componentId));

        promise.then(
            function (components) {
                dispatch(fetchComponentResourcesSuccess(components.data));
            },
            function (error) {
                dispatch(fetchComponentResourcesFailure(error));
            }
        );

        return promise;
    };
}

export const fetchComponentResourcesSuccess = (resources: $TSFixMe) => {
    return {
        type: types.FETCH_COMPONENT_RESOURCES_SUCCESS,
        payload: resources,
    };
};

export const fetchComponentResourcesRequest = (componentId: $TSFixMe) => {
    return {
        type: types.FETCH_COMPONENT_RESOURCES_REQUEST,
        payload: { componentId: componentId },
    };
};

export const fetchComponentResourcesFailure = (error: ErrorPayload) => {
    return {
        type: types.FETCH_COMPONENT_RESOURCES_FAILURE,
        payload: error,
    };
};

export const resetFetchComponentResources = () => {
    return {
        type: types.FETCH_COMPONENT_RESOURCES_RESET,
    };
};

// Component Summary
export function fetchComponentSummary(
    projectId: $TSFixMe,
    componentId: $TSFixMe,
    startDate: $TSFixMe,
    endDate: $TSFixMe
) {
    return function (dispatch: Dispatch) {
        const promise = BackendAPI.post(
            `component/${projectId}/summary/${componentId}`,
            { startDate, endDate }
        );
        dispatch(fetchComponentSummaryRequest(componentId));

        promise.then(
            function (components) {
                dispatch(fetchComponentSummarySuccess(components.data));
            },
            function (error) {
                dispatch(fetchComponentSummaryFailure(error));
            }
        );

        return promise;
    };
}

export const fetchComponentSummarySuccess = (summary: $TSFixMe) => {
    return {
        type: types.FETCH_COMPONENT_SUMMARY_SUCCESS,
        payload: summary,
    };
};

export const fetchComponentSummaryRequest = (componentId: $TSFixMe) => {
    return {
        type: types.FETCH_COMPONENT_SUMMARY_REQUEST,
        payload: componentId,
    };
};

export const fetchComponentSummaryFailure = (error: ErrorPayload) => {
    return {
        type: types.FETCH_COMPONENT_SUMMARY_FAILURE,
        payload: error,
    };
};

export const resetFetchComponentSummary = () => {
    return {
        type: types.FETCH_COMPONENT_SUMMARY_RESET,
    };
};

export const addCurrentComponent = (currentComponent: $TSFixMe) => {
    return {
        type: types.ADD_CURRENT_COMPONENT,
        payload: currentComponent,
    };
};

export const fetchComponentRequest = () => {
    return {
        type: types.FETCH_COMPONENT_REQUEST,
    };
};

export const fetchComponentSuccess = (payload: $TSFixMe) => {
    return {
        type: types.FETCH_COMPONENT_SUCCESS,
        payload,
    };
};

export const fetchComponentFailure = (error: ErrorPayload) => {
    return {
        type: types.FETCH_COMPONENT_FAILURE,
        payload: error,
    };
};

export const fetchComponent = (projectId: $TSFixMe, slug: $TSFixMe) => {
    return function (dispatch: Dispatch) {
        const promise = BackendAPI.get(`component/${projectId}/slug/${slug}`);
        dispatch(fetchComponentRequest());

        promise.then(
            function (component) {
                dispatch(fetchComponentSuccess(component.data));
            },
            function (error) {
                dispatch(fetchComponentFailure(error));
            }
        );

        return promise;
    };
};
