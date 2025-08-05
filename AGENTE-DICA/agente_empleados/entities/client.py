class cliente():
    id: int
    tel: int
    nombre: str

    def to_json(self) -> str:
        """
        Transforma el objeto cliente a un string de json.

        Returns:
            La representacion en json del objeto cliente.
        """
        return self.model_dump_json(indent=4)