import { useContext } from "react";
import { globalContext } from "../GlobalContextProvider";
import { Container } from "react-bootstrap";

export default function OwnerReport(){

    const {users} = useContext(globalContext);

    return (
        <Container>
            {users?.map(u=><div>{u.id}</div>)}aa
        </Container>
    )
}