import { EntityCreatedBase } from "./EntityCreatedBase";

export class EnabledEntityBase extends EntityCreatedBase {
    @column
    disabled: boolean;
}

