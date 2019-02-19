import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

function noOp() {}

if (typeof window.URL.createObjectURL === "undefined") {
  Object.defineProperty(window.URL, "createObjectURL", { value: noOp });
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 2 * 60 * 1000;
// jest.setTimeout(2 * 60 * 1000);

configure({ adapter: new Adapter() });
