import { CustomUser} from "../services/userService";

declare global {
  namespace Express {
    interface User extends CustomUser{}
  }
}
