import mongoose, { RequiredFields } from '../utils/ORM';

const Schema = mongoose.Schema;

const schema = new Schema(
    {
        securityId: {
            type: Schema.Types.ObjectId,
            ref: 'ContainerSecurity',
            index: true,
        },
        componentId: {
            type: Schema.Types.ObjectId,
            ref: 'Component',
            index: true,
        },
        data: Object,
        deleted: { type: Boolean, default: false },
        deleteAt: Date,
    },
    { timestamps: true }
);

export const requiredFields: RequiredFields = schema.requiredPaths();

export default mongoose.model('ContainerSecurityLog', schema);
