import { ProjectResolver } from "./Project";
import { TeamResolver } from "./Team";
import { UserResolver } from "./User";

export default [UserResolver , TeamResolver , ProjectResolver] as const;