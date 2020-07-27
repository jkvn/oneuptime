import React, { Component } from 'react';
import moment from 'moment';
import Slide from 'react-reveal/Slide';
import { PropTypes } from 'prop-types';
import { logEvent } from '../../analytics';
import { SHOULD_LOG_ANALYTICS } from '../../config';
import { bindActionCreators } from 'redux';
import { markAsRead } from '../../actions/notification';
import { connect } from 'react-redux';
import { history } from '../../store';

class IncidentCreated extends Component {
    markAsRead(notification) {
        const {
            projectId,
            _id: notificationId,
            meta: { componentId, incidentId },
        } = notification;
        this.props.markAsRead(projectId, notificationId);
        if (SHOULD_LOG_ANALYTICS) {
            logEvent('EVENT: DASHBOARD > NOTIFICATION MARKED AS READ', {});
        }
        history.push(
            `/dashboard/project/${projectId}/${componentId}/incidents/${incidentId}`
        );
    }

    render() {
        const { notifications } = this.props;

        return (
            <Slide bottom>
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        zIndex: 1,
                        margin: '0 30px 20px 0',
                    }}
                >
                    <div className="ContextualPopover-contents">
                        <div
                            className="Box-root"
                            id="notificationscroll"
                            style={{
                                width: '450px',
                                maxHeight: '350px',
                                overflowX: 'scroll',
                            }}
                        >
                            <div
                                className="Box-root Box-divider--surface-bottom-1 Padding-all--12"
                                style={{
                                    boxShadow: '1px 1px rgba(188,188,188,0.5)',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <span
                                        style={{
                                            color: '#24b47e',
                                            paddingLeft: '15px',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        NEW INCIDENT CREATED
                                    </span>
                                </div>
                            </div>
                            <div className="Box-root Padding-all--4">
                                <div
                                    className="Box-root"
                                    style={{
                                        fontWeight: '500',
                                    }}
                                >
                                    {notifications && notifications.length > 0
                                        ? notifications.map(notification => {
                                              return (
                                                  <div
                                                      className="Box-root Box-background--red4"
                                                      style={{
                                                          padding: '10px 10px',
                                                          fontWeight: '400',
                                                          fontSize: '1em',
                                                          borderBottom:
                                                              '1px solid #ffffff',
                                                          borderRadius: '2px',
                                                      }}
                                                      key={notification._id}
                                                  >
                                                      <div className="Notify-fyipe">
                                                          <img
                                                              src={`/dashboard/assets/img/${
                                                                  notification.icon
                                                                      ? notification.icon
                                                                      : 'information'
                                                              }.svg`}
                                                              className="Notify-fyipe-row-primary"
                                                              style={{
                                                                  height:
                                                                      '20px',
                                                                  width: '20px',
                                                              }}
                                                              alt="notify"
                                                          />
                                                          <span className="Notify-fyipe-row-secondary Text-color--white">
                                                              {
                                                                  notification.message
                                                              }{' '}
                                                              on{' '}
                                                              {moment(
                                                                  notification.createdAt
                                                              ).format(
                                                                  'MMMM Do YYYY, h:mm a'
                                                              )}
                                                          </span>
                                                      </div>
                                                      <div className="Notify-fyipe">
                                                          <span></span>
                                                          <button
                                                              id="createIncident"
                                                              className="bs-Button"
                                                              style={{
                                                                  height:
                                                                      '30px',
                                                                  width: '50px',
                                                              }}
                                                              onClick={() =>
                                                                  this.markAsRead(
                                                                      notification
                                                                  )
                                                              }
                                                              type="button"
                                                          >
                                                              <span>View</span>
                                                          </button>
                                                      </div>
                                                  </div>
                                              );
                                          })
                                        : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Slide>
        );
    }
}

IncidentCreated.displayName = 'IncidentCreated';

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ markAsRead }, dispatch);
};

IncidentCreated.propTypes = {
    notifications: PropTypes.array,
    markAsRead: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(IncidentCreated);
