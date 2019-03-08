import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import toJson from 'enzyme-to-json'
import Adapter from 'enzyme-adapter-react-16'
import Avatar  from './Avatar'

// TASK 1: configure the Enzyme adapter. Hint https://airbnb.io/enzyme/
// Put this in a config file and add this to the package.json with the path to the config
// Enzyme.configure({ adapter: new Adapter() });

describe('<Avatar />', () => {
  it('renders Avatar', () => {
    // You can use console.log(wrapper.debug()) to console.log the component that you are testing
    // TASK 2: Shallow the Avatar component
    //    Hint:  https://github.com/adriantoine/enzyme-to-json#helper
    const wrapper = shallow(<Avatar username={'testuser'}/>)
    console.log(wrapper.debug())
    // TASK 3: Create the snapshot
    expect(toJson(wrapper)).toMatchSnapshot()

  })
})
