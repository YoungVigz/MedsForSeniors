
/**
 * Represents the various types of medications.
 * They are grouped by the method of administration.
 */
export type MedicationType =
  // Oral
  | 'Syrup'
  | 'Tincture'
  | 'Granules'
  | 'Mixture'
  | 'Drops'
  | 'Compounds'
  | 'DividedPowder'
  | 'Pills'
  | 'Capsules'
  | 'Tablets'
  | 'Suspension'
  | 'Antibiotic'
  // Body Cavities
  | 'Suppositories'
  | 'VaginalSuppositories'
  | 'Rods'
  // External
  | 'UndividedPowder'
  | 'MedicatedPatches'
  | 'Compress'
  | 'Paste'
  | 'Ointment'
  // Combined
  | 'Emulsions'
  | 'Powders';

/**
 * Dosage type for liquid medications.
 * The dosage can be measured in milliliters or tablespoons.
 */
type LiqudDosage = 
  | { unit: 'milliliters'; value: number }
  | { unit: 'tablespoons'; value: number };

/**
 * Dosage type for medications administered as drops.
 */  
type DropsDosage = { unit: 'drops'; value: number }

/**
 * Dosage type for solid medications where the dosage is defined in pieces.
 */
type SolidDosage = { unit: 'pieces'; value: number }

/**
 * Dosage type for medications that should be taken as prescribed.
 * In such cases, the dosage unit is indicated as 'asPrescribed'.
 */
type AsPresribedDosage = { unit: 'asPrescribed' }


/**
 * Maps each MedicationType to its corresponding dosage format.
 * This ensures that only the appropriate dosage format is provided for each medication type.
 */
interface DosageMapping {
  Syrup: LiqudDosage;
  Tincture: LiqudDosage;
  Granules: LiqudDosage;
  Mixture: LiqudDosage;
  Suspension: LiqudDosage;
  Antibiotic: AsPresribedDosage;
  Drops: DropsDosage;
  Compounds: SolidDosage;
  DividedPowder: SolidDosage;
  Pills: SolidDosage;
  Capsules: SolidDosage;
  Tablets: SolidDosage;
  Suppositories: SolidDosage;
  VaginalSuppositories: SolidDosage;
  Rods: SolidDosage;
  UndividedPowder: { unit: 'dailyAmount'; value: number };
  MedicatedPatches: { unit: 'pieces'; value: number };
  Compress: { unit: 'dailyAmount'; value: number };
  Paste: { unit: 'dailyAmount'; value: number };
  Ointment: { unit: 'dailyAmount'; value: number };
  Emulsions: LiqudDosage;
  Powders: { unit: 'dailyAmount'; value: number };
}

/**
 * Represents a medication with a generic dosage format based on its type.
 * The generic parameter T ensures that the dosage provided matches the expected type.
 *
 * @template T - The medication type, defaults to any MedicationType.
 * @usage const medication: Mediction<"Pills"> = {
 *  id: '1',
 *  genericName: 'nameOfMedication',
 *  type: "Pills",
 *  dosage: {
 *    unit: 'pieces',
 *    value: 1
 *  }
 * };
 * 
 */
export type Medication<T extends MedicationType = MedicationType> = {
  id: string;
  genericName: string;
  brandName?: string;
  type: T;
  dosage: DosageMapping[T];
};