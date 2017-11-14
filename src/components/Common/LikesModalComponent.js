import React from 'react';
import { getStore } from '../../store/configureStore';
import {
    connect
  } from 'react-redux';
import {
    getVoters
} from '../../actions/voters';

import UserItem from '../UserProfile/userItem';
import Constants from '../../common/constants';

class LikesModalComponent extends React.Component {
    constructor(props) {
        super();
        this.state = {
            ...this.getInitialData
        }
    }

    get getInitialData() {
        return {
          offset : null,
          previousRequestOffset : 'default offset',
          voters : [],
          hasMore : true,
          options : {},
          users : []
        }
    }

    get permLink() {
        let urlObject = this.state.url.split('/');
        if (urlObject.length < 2) {
            console.warn('Some troubles with permLink in LikesComponent');
            return '';
        }
        return `${urlObject[urlObject.length - 2]}/${urlObject[urlObject.length - 1]}`
    }

    selectVotesInfo(state) {
        return state.votes;
    }

    componentDidMount() {
        let unsubscribe = getStore().subscribe(this.usersChanged.bind(this));
    }

    fetchData() {
        if (this.state.offset == this.state.previousRequestOffset) return false;
        const options = {
          point : `post/${this.permLink}/voters`,
          params : Object.assign({}, {
            offset : this.state.offset
          },
          this.state.options)
        };
        getVoters(options, this.props.dispatch.bind(this));
      }

    usersChanged() {
        let store = getStore();
        let state = store.getState();
        let votersInfo = this.selectVotesInfo(getStore().getState());
        if (votersInfo.voters.length == 0) {
            this.setState({
                url : votersInfo.url
            } ,() => {
                this.fetchData()            
            });
        } else {
            this.setState({
                previousRequestOffset : this.state.offset,
                offset : votersInfo.offset,
                voters : votersInfo.voters.results
            })
        }
    }

    get voters(){
        if (this.state.voters.length == 0) {
            return <div className="empty-query-message">{Constants.EMPTY_QUERY_VOTERS}</div>
        }
        return this.state.voters.map((voter, index) => 
            <UserItem 
                item={{
                    author : voter.username,
                    name : voter.name,
                    avatar : voter.profile_image
                }}
                key={index}
            />
        );
    }

    render() {
        return (
            <div id="likesModal" tabIndex="-1" role="dialog" aria-hidden="true" className="modal modal-like fade">
                <div className="modal-dialog">
                    <div className="modal-content likes-modal__content js--dont-close-likes-modal">
                        <div className="modal-header">
                            <div className="modal-title clearfix">
                                This post is like these users
                            </div>
                        </div>
                        <div className="user-list">
                            { this.voters }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
      localization: state.localization
    };
};

export default connect(mapStateToProps)(LikesModalComponent);