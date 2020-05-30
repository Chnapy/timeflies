
export const getId = (o: { id: string } | { staticData: { id: string } }): string => 'id' in o ? o.id : o.staticData.id;

export const getLast = <I>(arr: I[]): I | undefined => arr[arr.length - 1];
