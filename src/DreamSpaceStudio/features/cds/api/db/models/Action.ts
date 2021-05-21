import { EnumEntity } from "./Common/EnumEntity";
import { table } from "./Common/DbSet";

@table("actions")
export class Action extends EnumEntity
{
}
