import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import { withRouter } from "react-router-dom";
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

// import MESSAGES_QUERY from './Messages.graphql'
import { THREADS_QUERY } from '../../Threads'
import colours from "../../../../App/styles/export/colours.css";
import Avatar from "../../../../App/components/Layout/Avatar";
import Icon from "../../../../App/components/Layout/Icon";
import Snackbar from "@material-ui/core/Snackbar";

const MessagesWrapper = styled.div`
  display: flex;
  flex: 2;
  flex-direction: column;
  justify-content: space-between;
`;

const MessagesList = styled.div`
  padding: 1em;
  overflow-y: auto;
  p {
    color: ${colours.darkGrey};
    font-size: 0.9em;
  }
`;

const NewMessage = styled.div`
  min-height: 20px;
  padding: 1em;
  border-top: 1px solid ${colours.mediumGrey};
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  height: 60px;
`;

const MessageBox = styled.input`
  border-color: transparent;
  width: 90%;
`;

const MessageWrapper = styled.div`
  padding: 0.5em;
  display: flex;

  ${props =>
    props.from === "sent" &&
    css`
      justify-content: flex-end;
    `}
`;

const MessageRead = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: flex-end;
`;

const Message = styled.div`
  border-radius: 20px;
  padding: 0.5em 1em;
  display: inline-block;
  font-size: 0.9rem;
  background: ${props =>
    props.from === "received" ? colours.lightGrey : colours.lightBlue};
  color: ${props =>
    props.from === "received" ? colours.black : colours.white};
`;

class Messages extends React.Component {
  state = {
    newMessage: ""
  };

  sendMessage = async () => {
    const { username } = this.props;
    const { newMessage } = this.state;

    await this.props.sendMessage({
      variables: {
        to: username,
        from: "me",
        message: newMessage
      }
    });

    this.setState({ newMessage: "" });
  };

  render() {
    const {
      data: { conversationConnection, loading },
      username
    } = this.props;
    if (loading) {
      return <h2>Loading...</h2>;
    }

    const styledConversation = conversationConnection.edges.map(
      ({ node }, i) => (
        <MessageWrapper
          key={i}
          from={node.from === "you" ? "sent" : "received"}
        >
          {node.to === "you" && <Avatar username={username} size="medium" />}
          <Message from={node.from === "you" ? "sent" : "received"}>
            {node.message}
          </Message>
          {node.from === "you" && (
            <MessageRead>
              <Icon name="check-circle" size={0.6} />
            </MessageRead>
          )}
        </MessageWrapper>
      )
    );

    return (
      <MessagesWrapper>
        <MessagesList>
          {styledConversation.length ? (
            styledConversation
          ) : (
            <p>You have no messages</p>
          )}
        </MessagesList>
        <NewMessage>
          <MessageBox
            onChange={e => this.setState({ newMessage: e.target.value })}
            type="text"
            value={this.state.newMessage}
            placeholder="Type your message..."
          />
          <button onClick={this.sendMessage}>Send</button>
        </NewMessage>
      </MessagesWrapper>
    );
  }
}

Messages.propTypes = {
  data: PropTypes.object,
  username: PropTypes.string.isRequired
};

Messages.defaultProps = {
  data: {
    loading: true
  }
};


const CONVERSATION_CONNECTION_QUERY = gql`
query conversationConnection($username: String!)  {
  conversationConnection(username: $username) {
    edges{
      node{
        to
        from
        message
      }
    }
  }
}
`
// use the following function to send a message
const sendMessage = graphql(gql`
mutation ($from: String!, $to: String!, $message: String! ) {
  sendMessage(input: {from: $from, to: $to, message: $message}){
    id
    time
    to
    from
    message
  }
}
`,
{
  // The options specify the variables you need explictly
  options: (props) => ({
    refetchQueries: [{
      query: 
      CONVERSATION_CONNECTION_QUERY
      ,
      variables: {username: props.username}
    }],
  }),
    // TODO https://www.apollographql.com/docs/react/advanced/caching.html#after-mutations
    update: (store, { data: { sendMessage } }) => {
      const query = {query: THREADS_QUERY};

      // Read the data from our cache for this query.

      // Old code before using the solution repo
      // const data = store.readQuery({ query: CONVERSATION_CONNECTION_QUERY });
      const data = store.readQuery(query);
      // Add our comment from the mutation to the end.
      data.comments.push(sendMessage);
      // Write our data back to the cache.

      // Old code before using the solution repo
      // store.writeQuery({ query: CONVERSATION_CONNECTION_QUERY, data });
      store.writeQuery(...query, data );

      // TODO you need to update a thread and write the Query again in the cache
      // Hint https://www.apollographql.com/docs/react/advanced/caching.html#writequery-and-writefragment
    },
  name: 'sendMessage',
})

// export default withRouter(Messages);
// export default sendMessage( withRouter(graphql(CONVERSATION_CONNECTION_QUERY)(Messages)))

const withConversation = graphql(CONVERSATION_CONNECTION_QUERY)
export default compose(withRouter, withConversation,sendMessage)(Messages);
