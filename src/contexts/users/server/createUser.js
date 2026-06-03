import {Random} from 'meteor/random'
import {getUsersCollection} from "../../../api/collections/getUsersCollection";
import {safeWhileAsync} from "../../../api/utils/safeWhile";
import {RestoreCodes} from "../../../api/accounts/RestoreCodes";

export const createUser = async ({voice, speed, termsAndConditionsIsChecked, /* researchEmail, */ isDev, email}) => {
    const collection = getUsersCollection()

    // since older app versions do not send this flag
    // we can't 100% require this to be present
    const terms = termsAndConditionsIsChecked ? new Date() : undefined

    const account = {}

    if (email) {
        account.email = email
    }
    else {
        account.username = Random.hexString(32)
    }

    const restoreCode = await safeWhileAsync(async () => {
        const codes = RestoreCodes.generate()
        const r = codes.join('-')
        const hasCodes = await collection.countDocuments({restore: r}) > 0
        if (!hasCodes) {
            return r
        }
    })
    account.password = restoreCode
    const newUserId = await Accounts.createUserAsync(account)
    const updateDoc = {terms, isDev}

    await getUsersCollection().updateAsync(newUserId, {$set: updateDoc})

    return { userId: newUserId, restoreCode }
}