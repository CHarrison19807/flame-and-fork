export const parseName = ({
  name,
  given_name: givenName,
  family_name: familyName,
}: {
  name: string;
  given_name?: string;
  family_name?: string;
}): string => {
  if (givenName && familyName) {
    return `${givenName} ${familyName}`;
  }

  return name;
};
