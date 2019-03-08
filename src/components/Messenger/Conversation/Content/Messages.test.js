import React from 'react'
import { shallow, mount } from 'enzyme'
import { MemoryRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import waitForExpect from 'wait-for-expect'

import configureStore from '../../../../store'
import ComposedMessages, { Messages, MessageBox, Message } from './Messages'

describe('<Messages />', () => {

  // This is somewhere between white and black box testing
  it(`should send a message (unit test)`, async () => {
    // 1. shallow the <Messages /> component
    // Gives us a render component with a few extra things
    // const wrapper = shallow(<Messages username={"testuser"} receiveMessage={()=>{'testmessage'}}/>)
    // You can use console.log(wrapper.debug()) to console.log the component that you are testing
    
    // 2  Mock the api. Hint, the api functions are passed as a defaultProp (look at the bottom of Messages.js),
    // you can override that prop by doing <Messages api={my_mocked_api_object} />
    const my_mocked_api_object = {
      sendMessage: jest.fn((message) => Promise.resolve(message))
    };
    const wrapper = shallow(
      <Messages 
        api={my_mocked_api_object}
        username={"testuser"}
        receiveMessage={()=>{'testmessage'}}
      />
    );
    console.log(wrapper.debug());

    // 3. Find the button -> you have an example here http://airbnb.io/enzyme/#shallow-rendering
    await wrapper.find('button').simulate('click');

    // 4. Click on the button -> you have an example here http://airbnb.io/enzyme/#shallow-rendering

    // 5. Assert the 'message was sent' -> 
    //      You can use toHaveBeenCalled on the my_mocked_api_object you passed. 
    //      toHaveBeenCalled needs a mock function https://jestjs.io/docs/en/mock-functions, is your sendMessage a mock?
    //      You have an example here http://airbnb.io/enzyme/#shallow-rendering heads-up!
    //      Enzyme expectations are not camel case,
    //      Jest expectations are camel case (for when you copy&paste :)
    // const mockCallback = jest.fn(my_mocked_api_object);
    // mockCallback()

    expect(my_mocked_api_object.sendMessage).toHaveBeenCalled();
    // expect(receiveMessage).toHaveBeenCalled({messages:'testmessage', "to": 'testuser'})
    // Final questions:
    // - Is this black-box testing or white-box testing?
    // - If I remove Redux from my application and put all the state in React, do I need to update this test?
    // - What's your level of confidence that the user will be able to send a message?
  })

  it(`should send a message (integration test)`, async () => {
    // 1. shallow or mount the <Messages /> component ?
    //    A) which component, Messages or ComposedMessages?
    //    B) If you mount the component then all the children are rendered. Hint: you need to provide a store.

    const my_mocked_api_object = {
      sendMessage: jest.fn((message) => Promise.resolve(message))
    };

    const store = configureStore();

    const wrapper = mount(
      <Provider store={store}>
        <ComposedMessages 
          api={my_mocked_api_object}
          username={'andrea'}
          receiveMessage={()=>{'testmessage'}}
        />
      </Provider>
    );
    console.log(wrapper.debug());

    console.log(wrapper.find(MessageBox).props())

    // At this point there is no message
    expect(wrapper.find(Message).length).toBe(0)

    // 2  Mock the api. Hint, the api functions are passed as a defaultProp (look at the bottom of Messages.js),
    // you can override that prop by doing <Messages api={my_mocked_api_object} />
    
    // 3. Add some text to the input
    // Hint: wrapper.find(MessageBox).props().onChange({ target: { value: 'hi!' }})
    // The await is a bit of a hack
    wrapper.find(MessageBox).props().onChange({ target: { value: 'hi!' }})

    // 4. Find the button -> you have an example here http://airbnb.io/enzyme/#shallow-rendering
    wrapper.find('button').simulate('click');

    // 5. Click on the button -> you have an example here http://airbnb.io/enzyme/#shallow-rendering
    // Heads-up! you need to use await on the click button. Or even better use https://www.npmjs.com/package/wait-for-expect

    // 6. You need to update the rendered component using http://airbnb.io/enzyme/docs/api/ShallowWrapper/update.html

    await waitForExpect(() => {
      wrapper.update()
      expect(wrapper.find(Message).length).toBe(1)
      expect(wrapper.find(Message).text()).toBe('hi!')
      }
    )

    // wrapper.update();


    // 7. Assert the 'message was sent' -> you can just validate the message you sent is on the Messages list
    // expect(receiveMessage).toHaveBeenCalled({messages:'hi', to: 'andrea'})
    // Final questions:
    // - Is this black-box testing or white-box testing? grey testing
    // - If I remove Redux from my application and put all the state in React, do I need to update this test? yes
    // - What's your level of confidence that the user will be able to send a message?
  })
})
