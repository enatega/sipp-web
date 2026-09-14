export type VendorZone = { id: string; title: string };

export type VendorApplicationOptions = { zones: VendorZone[] };

export type VendorApplicationValues = {
  name: string;
  email: string;
  phone: string;
  city: string;
  zone_id: string;
  password: string;
  confirmPassword: string;
  vendorImage: File | null;
  business_liscence_front_file: File | null;
  business_liscence_back_file: File | null;
  national_id_front_file: File | null;
  national_id_back_file: File | null;
};

export type VendorApplicationResult = {
  applicationId: string;
  status: "pending";
  confirmationEmailSent: boolean;
  message: string;
};
