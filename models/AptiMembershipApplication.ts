import mongoose, { Schema, Model } from "mongoose";
import {
  BLOOD_GROUPS,
  GENDERS,
  REGIONS,
  QUALIFICATIONS,
  NATIONALITIES,
  type BloodGroup,
  type Gender,
  type Region,
  type Qualification,
  type Nationality,
} from "@/lib/apti-membership-application";

// Captures the "APTI Life Membership + APTICON Registration" bundled option — the same fields as
// https://aptiindia.org/membership_form_general, for APTI to review and process into their own
// membership registry (models/AptiMember.ts) separately. Name/email/phone/photo live on the
// linked Registration document, not duplicated here.
export interface IAptiMembershipApplication {
  _id: mongoose.Types.ObjectId;
  registration: mongoose.Types.ObjectId;

  // Personal
  bloodGroup: BloodGroup;
  gender: Gender;
  dob: Date;

  // Professional details
  college: string;
  professionalState: string;
  region: Region;
  qualification: Qualification;
  teachingExperience: string;
  professionalExperience: string;
  nationality: Nationality;
  professionalStatus?: string;
  institutionalLetterKey: string;
  institutionalLetterUrl: string;
  institutionalLetterName: string;
  reference?: string;

  // Office address
  officeAddress: string;
  officePincode: string;
  officeCity: string;
  officeState: string;
  officePhone: string;
  officeFax?: string;
  officeEmail: string;

  // Residence / communication address
  residenceAddress: string;
  residencePincode: string;
  residenceCity: string;
  residenceState: string;
  residencePhone: string;
  residenceEmail: string;

  status: "submitted";
  createdAt: Date;
  updatedAt: Date;
}

const AptiMembershipApplicationSchema =
  new Schema<IAptiMembershipApplication>(
    {
      registration: {
        type: Schema.Types.ObjectId,
        ref: "Registration",
        required: true,
        unique: true,
        index: true,
      },

      bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
      gender: { type: String, enum: GENDERS, required: true },
      dob: { type: Date, required: true },

      college: { type: String, required: true, trim: true },
      professionalState: { type: String, required: true, trim: true },
      region: { type: String, enum: REGIONS, required: true },
      qualification: { type: String, enum: QUALIFICATIONS, required: true },
      teachingExperience: { type: String, required: true, trim: true },
      professionalExperience: { type: String, required: true, trim: true },
      nationality: { type: String, enum: NATIONALITIES, required: true },
      professionalStatus: { type: String, trim: true },
      institutionalLetterKey: { type: String, required: true },
      institutionalLetterUrl: { type: String, required: true },
      institutionalLetterName: { type: String, required: true },
      reference: { type: String, trim: true },

      officeAddress: { type: String, required: true, trim: true },
      officePincode: { type: String, required: true, trim: true },
      officeCity: { type: String, required: true, trim: true },
      officeState: { type: String, required: true, trim: true },
      officePhone: { type: String, required: true, trim: true },
      officeFax: { type: String, trim: true },
      officeEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      residenceAddress: { type: String, required: true, trim: true },
      residencePincode: { type: String, required: true, trim: true },
      residenceCity: { type: String, required: true, trim: true },
      residenceState: { type: String, required: true, trim: true },
      residencePhone: { type: String, required: true, trim: true },
      residenceEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      status: { type: String, enum: ["submitted"], default: "submitted" },
    },
    { timestamps: true },
  );

const AptiMembershipApplication: Model<IAptiMembershipApplication> =
  (mongoose.models
    .AptiMembershipApplication as Model<IAptiMembershipApplication>) ??
  mongoose.model<IAptiMembershipApplication>(
    "AptiMembershipApplication",
    AptiMembershipApplicationSchema,
  );

export default AptiMembershipApplication;
