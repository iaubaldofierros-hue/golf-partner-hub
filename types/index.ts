import type {
  Account, Contact, Activity, Promotion, Opportunity,
  AccountType, BusinessOrigin, User,
} from "@prisma/client";

export type AccountWithRelations = Account & {
  accountType: AccountType | null;
  businessOrigin: BusinessOrigin | null;
  owner: User | null;
  contacts: Contact[];
  _count?: { activities: number; opportunities: number };
};

export type ActivityWithRelations = Activity & {
  contact: Contact | null;
  account?: Account;
  promotion?: Promotion | null;
};

export type { Account, Contact, Activity, Promotion, Opportunity };
