import { Medication } from "./medication";

/**
 * Represents an individual item on the medication shelf.
 * Each item links a specific medication (via its unique identifier)
 * to the quantity of that medication available on the shelf.
 *
 * When the user chooses to add a medication to the shelf,
 * they are prompted to enter the quantity of the medication they have,
 * which corresponds to the medication type (e.g., pieces, milliliters, etc.).
 * When the quantity is low, a notification can be triggered.
 */
export interface ShelfItem {
    medication_id: Medication["id"],

    quantity: number
}

/**
 * Represents a medication shelf that stores multiple medication items.
 *
 * This shelf serves as an inventory for the medications the user possesses.
 * When the available quantity of any medication falls below a certain threshold,
 * a notification can be sent to alert the user.
 */
export interface Shelf {
    items: ShelfItem[],

}