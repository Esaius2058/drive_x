import { CustomUser} from "../services/userService";
import {CustomRequest} from "../controllers/uploadController"

declare global {
  namespace Express {
    interface User extends CustomUser{}
    interface Request extends CustomRequest {}
  }
}
