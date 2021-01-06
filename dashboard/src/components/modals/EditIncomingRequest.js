import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { closeModal } from '../../actions/modal';
import ShouldRender from '../basic/ShouldRender';
import { FormLoader } from '../basic/Loader';
import { RenderField } from '../basic/RenderField';
import { RenderSelect } from '../basic/RenderSelect';
import { editIncomingRequest } from '../../actions/incomingRequest';
import { RenderTextArea } from '../basic/RenderTextArea';
import Tooltip from '../basic/Tooltip';
import { incomingRequestVariables } from '../../config';

function validate(values) {
    const errors = {};

    if (!values.name || !values.name.trim()) {
        errors.name = 'Incoming request name is required';
    }

    return errors;
}

const bulletpoints = {
    display: 'listItem',
    listStyleType: 'disc',
    listStylePosition: 'inside',
};

class EditIncomingRequest extends Component {
    state = {
        monitorError: null,
    };

    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyBoard);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyBoard);
    }

    submitForm = values => {
        const {
            closeModal,
            editIncomingRequest,
            projectId,
            initialValues,
            destroy,
        } = this.props;
        const requestId = initialValues._id;
        const postObj = {};

        postObj.name = values.name;
        postObj.isDefault = values.isDefault;
        postObj.createIncident = values.createIncident;

        postObj.filterCriteria = values.filterCriteria;
        postObj.filterCondition = values.filterCondition;
        if (isNaN(values.filterText)) {
            postObj.filterText = values.filterText;
        } else {
            if (typeof values.filterText === 'string') {
                postObj.filterText = values.filterText;
            } else {
                postObj.filterText = Number(values.filterText);
            }
        }
        postObj.incidentTitle = values.incidentTitle;
        postObj.incidentType = values.incidentType;
        postObj.incidentPriority = values.incidentPriority;
        postObj.incidentDescription = values.incidentDescription;

        postObj.monitors = [];
        if (!postObj.isDefault) {
            if (values.monitors && values.monitors.length > 0) {
                const monitors = values.monitors.filter(
                    monitorId => typeof monitorId === 'string'
                );
                postObj.monitors = monitors;
            }

            const isDuplicate = postObj.monitors
                ? postObj.monitors.length === new Set(postObj.monitors).size
                    ? false
                    : true
                : false;

            if (isDuplicate) {
                this.setState({
                    monitorError: 'Duplicate monitor selection found',
                });
                postObj.monitors = [];
                return;
            }
        }

        editIncomingRequest(projectId, requestId, postObj).then(() => {
            if (!this.props.requesting && !this.props.requestError) {
                destroy();
                closeModal({
                    id: projectId, // the projectId was used as the id for this modal
                });
            }
        });
    };

    renderMonitors = ({ fields }) => {
        const { monitorError } = this.state;
        return (
            <>
                <div
                    style={{
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    <button
                        id="addMoreMonitor"
                        className="Button bs-ButtonLegacy ActionIconParent"
                        style={{
                            position: 'absolute',
                            zIndex: 1,
                            right: 0,
                        }}
                        type="button"
                        onClick={() => {
                            fields.push();
                        }}
                    >
                        <span className="bs-Button bs-FileUploadButton bs-Button--icon bs-Button--new">
                            <span>Add Monitor</span>
                        </span>
                    </button>
                    {fields.map((field, index) => {
                        return (
                            <div
                                style={{
                                    width: '65%',
                                    marginBottom: 10,
                                }}
                                key={index}
                            >
                                <Field
                                    className="db-select-nw Table-cell--width--maximized"
                                    component={RenderSelect}
                                    name={field}
                                    id={`monitorfield_${index}`}
                                    placeholder="Monitor"
                                    style={{
                                        height: '28px',
                                        width: '100%',
                                    }}
                                    options={[
                                        {
                                            value: '',
                                            label: 'Select a Monitor',
                                        },
                                        ...(this.props.monitors &&
                                        this.props.monitors.length > 0
                                            ? this.props.monitors.map(
                                                  monitor => ({
                                                      value: monitor._id,
                                                      label: `${monitor.componentId.name} / ${monitor.name}`,
                                                  })
                                              )
                                            : []),
                                    ]}
                                />
                                <button
                                    id="removeMonitor"
                                    className="Button bs-ButtonLegacy ActionIconParent"
                                    style={{
                                        marginTop: 10,
                                    }}
                                    type="button"
                                    onClick={() => {
                                        fields.remove(index);
                                    }}
                                >
                                    <span className="bs-Button bs-Button--icon bs-Button--delete">
                                        <span>Remove Monitor</span>
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                    {monitorError && (
                        <div
                            className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart"
                            style={{
                                marginTop: '5px',
                                alignItems: 'center',
                            }}
                        >
                            <div
                                className="Box-root Margin-right--8"
                                style={{ marginTop: '2px' }}
                            >
                                <div className="Icon Icon--info Icon--color--red Icon--size--14 Box-root Flex-flex"></div>
                            </div>
                            <div className="Box-root">
                                <span
                                    id="monitorError"
                                    style={{ color: 'red' }}
                                >
                                    {monitorError}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    };

    handleKeyBoard = e => {
        const { closeModal, projectId, destroy } = this.props;

        switch (e.key) {
            case 'Escape':
                destroy();
                return closeModal({
                    id: projectId,
                });
            case 'Enter':
                if (e.target.localName !== 'textarea') {
                    return document
                        .getElementById('editIncomingRequest')
                        .click();
                }
                break;
            default:
                return false;
        }
    };

    toggleShowAdvancedOptions = () =>
        this.props.change(
            'showAdvancedOptions',
            !this.props.formValues.showAdvancedOptions
        );

    toggleShowAvailableVariables = () =>
        this.props.change(
            'showAvailableVariables',
            !this.props.formValues.showAvailableVariables
        );

    render() {
        const {
            handleSubmit,
            projectId,
            formValues,
            closeModal,
            incidentPriorities,
            destroy,
        } = this.props;

        return (
            <div
                className="ModalLayer-contents"
                tabIndex="-1"
                style={{ marginTop: '40px' }}
            >
                <div className="bs-BIM">
                    <div className="bs-Modal" style={{ width: 700 }}>
                        <div className="bs-Modal-header">
                            <div
                                className="bs-Modal-header-copy"
                                style={{
                                    marginBottom: '10px',
                                    marginTop: '10px',
                                }}
                            >
                                <span className="Text-color--inherit Text-display--inline Text-fontSize--20 Text-fontWeight--medium Text-lineHeight--24 Text-typeface--base Text-wrap--wrap">
                                    <span>Edit Incoming Request</span>
                                </span>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit(this.submitForm)}>
                            <div className="bs-Modal-content">
                                <div className="bs-Fieldset-wrapper Box-root Margin-bottom--2">
                                    <fieldset className="Margin-bottom--16">
                                        <div className="bs-Fieldset-rows">
                                            <div
                                                className="bs-Fieldset-row"
                                                style={{ padding: 0 }}
                                            >
                                                <label
                                                    className="bs-Fieldset-label Text-align--left"
                                                    htmlFor="endpoint"
                                                    style={{
                                                        flexBasis: '20%',
                                                    }}
                                                >
                                                    <span>Name</span>
                                                </label>
                                                <div
                                                    className="bs-Fieldset-fields"
                                                    style={{
                                                        flexBasis: '80%',
                                                        maxWidth: '80%',
                                                    }}
                                                >
                                                    <div
                                                        className="bs-Fieldset-field"
                                                        style={{
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <Field
                                                            component={
                                                                RenderField
                                                            }
                                                            name="name"
                                                            type="input"
                                                            placeholder="Name of request"
                                                            id="name"
                                                            className="db-BusinessSettings-input TextInput bs-TextInput"
                                                            style={{
                                                                width: '100%',
                                                                padding:
                                                                    '3px 5px',
                                                            }}
                                                            autoFocus={true}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>

                                    {formValues && !formValues.isDefault && (
                                        <fieldset className="Margin-bottom--16">
                                            <div className="bs-Fieldset-rows">
                                                <div
                                                    className="bs-Fieldset-row"
                                                    style={{ padding: 0 }}
                                                >
                                                    <label
                                                        className="bs-Fieldset-label Text-align--left"
                                                        htmlFor="endpoint"
                                                        style={{
                                                            flexBasis: '20%',
                                                        }}
                                                    >
                                                        <span>Monitors</span>
                                                    </label>
                                                    <div
                                                        className="bs-Fieldset-fields"
                                                        style={{
                                                            flexBasis: '80%',
                                                            maxWidth: '80%',
                                                        }}
                                                    >
                                                        <div
                                                            className="bs-Fieldset-field"
                                                            style={{
                                                                width: '100%',
                                                            }}
                                                        >
                                                            <FieldArray
                                                                name="monitors"
                                                                component={
                                                                    this
                                                                        .renderMonitors
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </fieldset>
                                    )}

                                    <fieldset className="Margin-bottom--16">
                                        <div className="bs-Fieldset-rows">
                                            <div
                                                className="bs-Fieldset-row"
                                                style={{ padding: 0 }}
                                            >
                                                <label
                                                    className="bs-Fieldset-label Text-align--left"
                                                    htmlFor="isDefault"
                                                    style={{ flexBasis: '20%' }}
                                                >
                                                    <span></span>
                                                </label>
                                                <div
                                                    className="bs-Fieldset-fields"
                                                    style={{
                                                        paddingTop: '6px',
                                                        flexBasis: '80%',
                                                        maxWidth: '80%',
                                                    }}
                                                >
                                                    <div className="bs-Fieldset-field">
                                                        <label
                                                            className="Checkbox"
                                                            style={{
                                                                marginRight:
                                                                    '12px',
                                                            }}
                                                            htmlFor="isDefault"
                                                        >
                                                            <Field
                                                                component="input"
                                                                type="checkbox"
                                                                name="isDefault"
                                                                className="Checkbox-source"
                                                                id="isDefault"
                                                            />
                                                            <div className="Checkbox-box Box-root Margin-right--2">
                                                                <div className="Checkbox-target Box-root">
                                                                    <div className="Checkbox-color Box-root"></div>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="Box-root"
                                                                style={{
                                                                    paddingLeft:
                                                                        '5px',
                                                                }}
                                                            >
                                                                <span>
                                                                    Use as
                                                                    default
                                                                    incoming
                                                                    request
                                                                </span>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset className="Margin-bottom--16">
                                        <div className="bs-Fieldset-rows">
                                            <div
                                                className="bs-Fieldset-row"
                                                style={{ padding: 0 }}
                                            >
                                                <label
                                                    className="bs-Fieldset-label Text-align--left"
                                                    htmlFor="createIncident"
                                                    style={{ flexBasis: '20%' }}
                                                >
                                                    <span></span>
                                                </label>
                                                <div
                                                    className="bs-Fieldset-fields"
                                                    style={{
                                                        paddingTop: '6px',
                                                        flexBasis: '80%',
                                                        maxWidth: '80%',
                                                    }}
                                                >
                                                    <div className="bs-Fieldset-field">
                                                        <label
                                                            className="Checkbox"
                                                            style={{
                                                                marginRight:
                                                                    '12px',
                                                            }}
                                                            htmlFor="createIncident"
                                                        >
                                                            <Field
                                                                component="input"
                                                                type="checkbox"
                                                                name="createIncident"
                                                                className="Checkbox-source"
                                                                id="createIncident"
                                                            />
                                                            <div className="Checkbox-box Box-root Margin-right--2">
                                                                <div className="Checkbox-target Box-root">
                                                                    <div className="Checkbox-color Box-root"></div>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="Box-root"
                                                                style={{
                                                                    paddingLeft:
                                                                        '5px',
                                                                }}
                                                            >
                                                                <span>
                                                                    Create
                                                                    Incident
                                                                </span>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset style={{ paddingTop: 0 }}>
                                        <div className="bs-Fieldset-rows">
                                            <div
                                                className="bs-Fieldset-row"
                                                style={{ padding: 0 }}
                                            >
                                                <label
                                                    className="bs-Fieldset-label Text-align--left"
                                                    htmlFor="showAdvancedOptions"
                                                    style={{
                                                        flexBasis: '20%',
                                                    }}
                                                ></label>
                                                <div
                                                    className="bs-Fieldset-fields"
                                                    style={{
                                                        flexBasis: '80%',
                                                        maxWidth: '80%',
                                                    }}
                                                >
                                                    <div
                                                        className="bs-Fieldset-field"
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 0px',
                                                            textDecoration:
                                                                'underline',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                cursor:
                                                                    'pointer',
                                                            }}
                                                            onClick={
                                                                this
                                                                    .toggleShowAdvancedOptions
                                                            }
                                                        >
                                                            {formValues &&
                                                            formValues.showAdvancedOptions
                                                                ? 'Hide advanced options'
                                                                : 'Show advanced options'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>
                                    {formValues &&
                                        formValues.showAdvancedOptions && (
                                            <>
                                                <fieldset className="Margin-bottom--16">
                                                    <div className="bs-Fieldset-rows">
                                                        <div
                                                            className="bs-Fieldset-row"
                                                            style={{
                                                                padding: 0,
                                                            }}
                                                        >
                                                            <label
                                                                className="bs-Fieldset-label Text-align--left"
                                                                style={{
                                                                    flexBasis:
                                                                        '20%',
                                                                }}
                                                            >
                                                                <span>
                                                                    Filters
                                                                </span>
                                                            </label>
                                                            <div
                                                                className="bs-Fieldset-fields"
                                                                style={{
                                                                    flexBasis:
                                                                        '80%',
                                                                    maxWidth:
                                                                        '80%',
                                                                }}
                                                            >
                                                                <div
                                                                    className="bs-Fieldset-field"
                                                                    style={{
                                                                        width:
                                                                            '100%',
                                                                    }}
                                                                >
                                                                    <Field
                                                                        className="db-select-nw Table-cell--width--maximized"
                                                                        component={
                                                                            RenderSelect
                                                                        }
                                                                        name="filterCriteria"
                                                                        id="filterCriteria"
                                                                        placeholder="Criteria"
                                                                        style={{
                                                                            height:
                                                                                '28px',
                                                                            width:
                                                                                '100%',
                                                                        }}
                                                                        options={[
                                                                            {
                                                                                value:
                                                                                    'thirdPartyVariable',
                                                                                label:
                                                                                    'Third Party Variables',
                                                                            },
                                                                        ]}
                                                                    />
                                                                    <Field
                                                                        className="db-select-nw Table-cell--width--maximized"
                                                                        component={
                                                                            RenderSelect
                                                                        }
                                                                        name="filterCondition"
                                                                        id="filterCondition"
                                                                        placeholder="Condition"
                                                                        style={{
                                                                            height:
                                                                                '28px',
                                                                            width:
                                                                                '100%',
                                                                            marginLeft: 5,
                                                                        }}
                                                                        options={[
                                                                            {
                                                                                value:
                                                                                    'equalTo',
                                                                                label:
                                                                                    'Equal To',
                                                                            },
                                                                            {
                                                                                value:
                                                                                    'notEqualTo',
                                                                                label:
                                                                                    'Not Equal To',
                                                                            },
                                                                            {
                                                                                value:
                                                                                    'greaterThan',
                                                                                label:
                                                                                    'Greater Than',
                                                                            },
                                                                            {
                                                                                value:
                                                                                    'lessThan',
                                                                                label:
                                                                                    'Less Than',
                                                                            },
                                                                            {
                                                                                value:
                                                                                    'lessThanOrEqualTo',
                                                                                label:
                                                                                    'Less Than Or Equal To',
                                                                            },
                                                                            {
                                                                                value:
                                                                                    'greaterThanOrEqualTo',
                                                                                label:
                                                                                    'Greater Than Or Equal To',
                                                                            },
                                                                        ]}
                                                                    />
                                                                    <Field
                                                                        component={
                                                                            RenderField
                                                                        }
                                                                        name="filterText"
                                                                        type="input"
                                                                        placeholder="Text to filter"
                                                                        id="filterText"
                                                                        className="db-BusinessSettings-input TextInput bs-TextInput"
                                                                        style={{
                                                                            width:
                                                                                '100%',
                                                                            padding:
                                                                                '3px 5px',
                                                                            marginLeft: 5,
                                                                        }}
                                                                        parentStyle={{
                                                                            marginRight: 5,
                                                                        }}
                                                                        autoFocus={
                                                                            true
                                                                        }
                                                                    />
                                                                    <Tooltip title="Incoming Request Filter">
                                                                        <p>
                                                                            Filter
                                                                            exposes
                                                                            the{' '}
                                                                            <code>
                                                                                request
                                                                            </code>{' '}
                                                                            object
                                                                            of
                                                                            an
                                                                            incoming
                                                                            request.
                                                                            The
                                                                            value
                                                                            on
                                                                            the{' '}
                                                                            <code>
                                                                                request
                                                                            </code>{' '}
                                                                            object
                                                                            can
                                                                            either
                                                                            be a
                                                                            string
                                                                            or a
                                                                            number
                                                                        </p>
                                                                        <p>
                                                                            Example
                                                                            properties
                                                                            include
                                                                            the
                                                                            following:
                                                                        </p>
                                                                        <p>
                                                                            <ul>
                                                                                <li>
                                                                                    <code>
                                                                                        request.body
                                                                                    </code>
                                                                                </li>
                                                                                <li>
                                                                                    <code>
                                                                                        request.query
                                                                                    </code>
                                                                                </li>
                                                                                <li>
                                                                                    <code>
                                                                                        request.headers
                                                                                    </code>
                                                                                </li>
                                                                            </ul>
                                                                        </p>
                                                                        <p>
                                                                            Usage
                                                                            examples
                                                                            include:
                                                                        </p>
                                                                        <p>
                                                                            <ul>
                                                                                <li>
                                                                                    <code>
                                                                                        1
                                                                                        |
                                                                                        request.body.value
                                                                                    </code>
                                                                                </li>
                                                                                <li>
                                                                                    <code>
                                                                                        2
                                                                                        |
                                                                                        response.query.value
                                                                                    </code>
                                                                                </li>
                                                                                <li>
                                                                                    <code>
                                                                                        3
                                                                                        |
                                                                                        request.header.value
                                                                                    </code>
                                                                                </li>
                                                                            </ul>
                                                                        </p>
                                                                    </Tooltip>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </fieldset>
                                                <fieldset>
                                                    <div className="bs-Fieldset-rows">
                                                        <div
                                                            className="bs-Fieldset-row"
                                                            style={{
                                                                padding: 0,
                                                            }}
                                                        >
                                                            <label
                                                                className="bs-Fieldset-label Text-align--left"
                                                                htmlFor="name"
                                                                style={{
                                                                    flexBasis:
                                                                        '20%',
                                                                }}
                                                            ></label>
                                                            <div
                                                                className="bs-Fieldset-fields"
                                                                style={{
                                                                    flexBasis:
                                                                        '80%',
                                                                    maxWidth:
                                                                        '80%',
                                                                }}
                                                            >
                                                                <div
                                                                    className="bs-Fieldset-field"
                                                                    style={{
                                                                        width:
                                                                            '100%',
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width:
                                                                                '100%',
                                                                            paddingBottom: 10,
                                                                            fontWeight: 500,
                                                                            fontSize: 14,
                                                                        }}
                                                                    >
                                                                        Incidents
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </fieldset>
                                                <fieldset className="Margin-bottom--16">
                                                    <div className="bs-Fieldset-rows">
                                                        <div
                                                            className="bs-Fieldset-row"
                                                            style={{
                                                                padding: 0,
                                                            }}
                                                        >
                                                            <label
                                                                className="bs-Fieldset-label Text-align--left"
                                                                htmlFor="incidentTitle"
                                                                style={{
                                                                    flexBasis:
                                                                        '20%',
                                                                }}
                                                            >
                                                                <span>
                                                                    Incident
                                                                    Title
                                                                </span>
                                                            </label>
                                                            <div
                                                                className="bs-Fieldset-fields"
                                                                style={{
                                                                    flexBasis:
                                                                        '80%',
                                                                    maxWidth:
                                                                        '80%',
                                                                }}
                                                            >
                                                                <div
                                                                    className="bs-Fieldset-field"
                                                                    style={{
                                                                        width:
                                                                            '100%',
                                                                    }}
                                                                >
                                                                    <Field
                                                                        component={
                                                                            RenderField
                                                                        }
                                                                        name="incidentTitle"
                                                                        type="input"
                                                                        placeholder="Monitor is offline"
                                                                        id="incidentTitle"
                                                                        className="db-BusinessSettings-input TextInput bs-TextInput"
                                                                        style={{
                                                                            width:
                                                                                '100%',
                                                                            padding:
                                                                                '3px 5px',
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </fieldset>
                                                <fieldset className="Margin-bottom--16">
                                                    <div className="bs-Fieldset-rows">
                                                        <div
                                                            className="bs-Fieldset-row"
                                                            style={{
                                                                padding: 0,
                                                            }}
                                                        >
                                                            <label
                                                                className="bs-Fieldset-label Text-align--left"
                                                                htmlFor="incidentType"
                                                                style={{
                                                                    flexBasis:
                                                                        '20%',
                                                                }}
                                                            >
                                                                <span>
                                                                    Incident
                                                                    Type
                                                                </span>
                                                            </label>
                                                            <div
                                                                className="bs-Fieldset-fields"
                                                                style={{
                                                                    flexBasis:
                                                                        '80%',
                                                                    maxWidth:
                                                                        '80%',
                                                                }}
                                                            >
                                                                <div
                                                                    className="bs-Fieldset-field"
                                                                    style={{
                                                                        width:
                                                                            '100%',
                                                                    }}
                                                                >
                                                                    <Field
                                                                        className="db-select-nw"
                                                                        component={
                                                                            RenderSelect
                                                                        }
                                                                        name="incidentType"
                                                                        id="incidentType"
                                                                        placeholder="Incident type"
                                                                        disabled={
                                                                            this
                                                                                .props
                                                                                .requesting
                                                                        }
                                                                        options={[
                                                                            {
                                                                                value:
                                                                                    'online',
                                                                                label:
                                                                                    'Online',
                                                                            },
                                                                            {
                                                                                value:
                                                                                    'offline',
                                                                                label:
                                                                                    'Offline',
                                                                            },
                                                                            {
                                                                                value:
                                                                                    'degraded',
                                                                                label:
                                                                                    'Degraded',
                                                                            },
                                                                        ]}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </fieldset>
                                                <ShouldRender
                                                    if={
                                                        incidentPriorities.length >
                                                        0
                                                    }
                                                >
                                                    <fieldset className="Margin-bottom--16">
                                                        <div className="bs-Fieldset-rows">
                                                            <div
                                                                className="bs-Fieldset-row"
                                                                style={{
                                                                    padding: 0,
                                                                }}
                                                            >
                                                                <label
                                                                    className="bs-Fieldset-label Text-align--left"
                                                                    htmlFor="incidentPriority"
                                                                    style={{
                                                                        flexBasis:
                                                                            '20%',
                                                                    }}
                                                                >
                                                                    <span>
                                                                        Incident
                                                                        Priority
                                                                    </span>
                                                                </label>
                                                                <div
                                                                    className="bs-Fieldset-fields"
                                                                    style={{
                                                                        flexBasis:
                                                                            '80%',
                                                                        maxWidth:
                                                                            '80%',
                                                                    }}
                                                                >
                                                                    <div
                                                                        className="bs-Fieldset-field"
                                                                        style={{
                                                                            width:
                                                                                '100%',
                                                                        }}
                                                                    >
                                                                        <Field
                                                                            style={{
                                                                                width:
                                                                                    '100%',
                                                                                padding:
                                                                                    '3px 5px',
                                                                            }}
                                                                            className="db-select-nw"
                                                                            component={
                                                                                RenderSelect
                                                                            }
                                                                            name="incidentPriority"
                                                                            id="incidentPriority"
                                                                            disabled={
                                                                                this
                                                                                    .props
                                                                                    .requesting
                                                                            }
                                                                            options={[
                                                                                ...incidentPriorities.map(
                                                                                    incidentPriority => ({
                                                                                        value:
                                                                                            incidentPriority._id,
                                                                                        label:
                                                                                            incidentPriority.name,
                                                                                    })
                                                                                ),
                                                                            ]}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </fieldset>
                                                </ShouldRender>
                                                <fieldset className="Margin-bottom--16">
                                                    <div className="bs-Fieldset-rows">
                                                        <div
                                                            className="bs-Fieldset-row"
                                                            style={{
                                                                padding: 0,
                                                            }}
                                                        >
                                                            <label
                                                                className="bs-Fieldset-label Text-align--left"
                                                                htmlFor="incidentDescription"
                                                                style={{
                                                                    flexBasis:
                                                                        '20%',
                                                                }}
                                                            >
                                                                <span>
                                                                    Incident
                                                                    Description
                                                                </span>
                                                            </label>
                                                            <div
                                                                className="bs-Fieldset-fields"
                                                                style={{
                                                                    flexBasis:
                                                                        '80%',
                                                                    maxWidth:
                                                                        '80%',
                                                                }}
                                                            >
                                                                <div
                                                                    className="bs-Fieldset-field"
                                                                    style={{
                                                                        width:
                                                                            '100%',
                                                                    }}
                                                                >
                                                                    <Field
                                                                        component={
                                                                            RenderTextArea
                                                                        }
                                                                        name="incidentDescription"
                                                                        type="text"
                                                                        rows="5"
                                                                        placeholder="Description of the incident"
                                                                        id="incidentDescription"
                                                                        className="db-BusinessSettings-input TextInput bs-TextInput"
                                                                        style={{
                                                                            width:
                                                                                '100%',
                                                                            padding:
                                                                                '3px 5px',
                                                                            whiteSpace:
                                                                                'normal',
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </fieldset>
                                                <fieldset
                                                    style={{ paddingTop: 0 }}
                                                >
                                                    <div className="bs-Fieldset-rows">
                                                        <div
                                                            className="bs-Fieldset-row"
                                                            style={{
                                                                padding: 0,
                                                            }}
                                                        >
                                                            <label
                                                                className="bs-Fieldset-label Text-align--left"
                                                                htmlFor="name"
                                                                style={{
                                                                    flexBasis:
                                                                        '20%',
                                                                }}
                                                            ></label>
                                                            <div
                                                                className="bs-Fieldset-fields"
                                                                style={{
                                                                    flexBasis:
                                                                        '80%',
                                                                    maxWidth:
                                                                        '80%',
                                                                }}
                                                            >
                                                                <div
                                                                    className="bs-Fieldset-field"
                                                                    style={{
                                                                        width:
                                                                            '100%',
                                                                        display:
                                                                            'block',
                                                                    }}
                                                                >
                                                                    {formValues &&
                                                                        !formValues.showAvailableVariables && (
                                                                            <div
                                                                                style={{
                                                                                    width:
                                                                                        '100%',
                                                                                    paddingBottom: 10,
                                                                                    textDecoration:
                                                                                        'underline',
                                                                                    cursor:
                                                                                        'pointer',
                                                                                }}
                                                                                onClick={
                                                                                    this
                                                                                        .toggleShowAvailableVariables
                                                                                }
                                                                            >
                                                                                Click
                                                                                to
                                                                                show
                                                                                available
                                                                                variables
                                                                            </div>
                                                                        )}
                                                                    {formValues &&
                                                                        formValues.showAvailableVariables && (
                                                                            <div>
                                                                                <span
                                                                                    className="template-variable-2"
                                                                                    style={{
                                                                                        display:
                                                                                            'block',
                                                                                        paddingBottom:
                                                                                            '10px',
                                                                                    }}
                                                                                >
                                                                                    You
                                                                                    can
                                                                                    use
                                                                                    these
                                                                                    available
                                                                                    variables
                                                                                    in
                                                                                    incident
                                                                                    title
                                                                                    or
                                                                                    description.
                                                                                </span>
                                                                                <span
                                                                                    className="template-variable-1"
                                                                                    style={{
                                                                                        display:
                                                                                            'block',
                                                                                    }}
                                                                                >
                                                                                    {incomingRequestVariables.map(
                                                                                        (
                                                                                            item,
                                                                                            index
                                                                                        ) => {
                                                                                            return (
                                                                                                <span
                                                                                                    key={
                                                                                                        index
                                                                                                    }
                                                                                                    className="template-variables"
                                                                                                    style={
                                                                                                        bulletpoints
                                                                                                    }
                                                                                                >
                                                                                                    {
                                                                                                        item.description
                                                                                                    }
                                                                                                    <br />
                                                                                                </span>
                                                                                            );
                                                                                        }
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </fieldset>
                                            </>
                                        )}
                                </div>
                            </div>
                            <div className="bs-Modal-footer">
                                <div className="bs-Modal-footer-actions">
                                    <ShouldRender
                                        if={
                                            !this.props.requesting &&
                                            this.props.requestError
                                        }
                                    >
                                        <div
                                            className="bs-Tail-copy"
                                            style={{ width: 200 }}
                                        >
                                            <div
                                                className="Box-root Flex-flex Flex-alignItems--stretch Flex-direction--row Flex-justifyContent--flexStart"
                                                style={{ marginTop: '10px' }}
                                            >
                                                <div className="Box-root Margin-right--8">
                                                    <div className="Icon Icon--info Icon--color--red Icon--size--14 Box-root Flex-flex"></div>
                                                </div>
                                                <div className="Box-root">
                                                    <span
                                                        style={{ color: 'red' }}
                                                    >
                                                        {
                                                            this.props
                                                                .requestError
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </ShouldRender>
                                    <button
                                        className="bs-Button bs-DeprecatedButton btn__modal"
                                        type="button"
                                        onClick={() => {
                                            destroy();
                                            closeModal({ id: projectId });
                                        }}
                                    >
                                        <span>Cancel</span>
                                        <span className="cancel-btn__keycode">
                                            Esc
                                        </span>
                                    </button>
                                    <button
                                        className="bs-Button bs-DeprecatedButton bs-Button--blue btn__modal"
                                        disabled={this.props.requesting}
                                        type="submit"
                                        id="editIncomingRequest"
                                    >
                                        {!this.props.requesting && (
                                            <>
                                                <span>Edit</span>
                                                <span className="create-btn__keycode">
                                                    <span className="keycode__icon keycode__icon--enter" />
                                                </span>
                                            </>
                                        )}
                                        {this.props.requesting && (
                                            <FormLoader />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

EditIncomingRequest.displayName = 'EditIncomingRequest';

EditIncomingRequest.propTypes = {
    closeModal: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    monitors: PropTypes.array,
    editIncomingRequest: PropTypes.func,
    requesting: PropTypes.bool,
    requestError: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.oneOf([null, undefined]),
    ]),
    formValues: PropTypes.object,
    initialValues: PropTypes.object,
    projectId: PropTypes.string,
    incidentPriorities: PropTypes.func,
    change: PropTypes.func.isRequired, // to manually change value of redux form state
    destroy: PropTypes.func.isRequired, // to manually destroy the redux form state
};

const EditIncomingRequestForm = reduxForm({
    form: 'editIncomingRequestForm', // a unique identifier for this form
    enableReinitialize: false,
    validate, // <--- validation function given to redux-form
    destroyOnUnmount: false,
})(EditIncomingRequest);

const mapDispatchToProps = dispatch =>
    bindActionCreators({ editIncomingRequest, closeModal }, dispatch);

const mapStateToProps = state => {
    const incomingRequestToBeUpdated = state.modal.modals[0].incomingRequest;
    const projectId = state.modal.modals[0].projectId;

    const initialValues = {};

    if (incomingRequestToBeUpdated) {
        initialValues.name = incomingRequestToBeUpdated.name;
        initialValues.isDefault = incomingRequestToBeUpdated.isDefault;
        initialValues.createIncident =
            incomingRequestToBeUpdated.createIncident;
        initialValues._id = incomingRequestToBeUpdated._id;
        initialValues.filterCriteria =
            incomingRequestToBeUpdated.filterCriteria;
        initialValues.filterCondition =
            incomingRequestToBeUpdated.filterCondition;
        initialValues.filterText = incomingRequestToBeUpdated.filterText;
        initialValues.incidentPriority =
            incomingRequestToBeUpdated.incidentPriority;
        initialValues.incidentTitle = incomingRequestToBeUpdated.incidentTitle;
        initialValues.incidentType = incomingRequestToBeUpdated.incidentType;
        initialValues.incidentDescription =
            incomingRequestToBeUpdated.incidentDescription;
        initialValues.showAdvancedOptions = false;
        initialValues.showAvailableVariables = false;
    }

    const monitorData = state.monitor.monitorsList.monitors.find(
        data => String(data._id) === String(projectId)
    );
    const monitors = monitorData ? monitorData.monitors : [];
    if (!initialValues.isDefault) {
        initialValues.monitors = incomingRequestToBeUpdated.monitors.map(
            monitor => monitor.monitorId._id
        );
    }

    return {
        monitors,
        requesting: state.incomingRequest.updateIncomingRequest.requesting,
        requestError: state.incomingRequest.updateIncomingRequest.error,
        formValues:
            state.form.editIncomingRequestForm &&
            state.form.editIncomingRequestForm.values,
        initialValues,
        projectId,
        incidentPriorities:
            state.incidentPriorities.incidentPrioritiesList.incidentPriorities,
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditIncomingRequestForm);
