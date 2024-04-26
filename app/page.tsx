"use client";

import { useEffect, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import Moment from 'moment';

class Principal {
  id: number;
  username: string;
  email: string;
  createdDate: string;
  updatedDate: string;
}

function findById(id: number, entities: Principal[] | undefined) {
  if (entities) {
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      if (entity.id == id) {
        return entity;
      }
    }
  }
}

function parseResponse(data: Response) {
  if (data.ok) {
    return data.json();
  }

  throw new Error('Something went wrong');
}

export default function Home() {
  const [show, setShow] = useState(false);
  const [entity, setEntity] = useState<Principal>(new Principal());
  const [entities, setEntities] = useState<Principal[]>();

  const loadEntities = () => {
    fetch('http://localhost:5290/v1/principals')
      .then(parseResponse)
      .then(data => {
        setEntities(data.data.content);
      })
      .catch(e => console.log(e));
  }

  useEffect(() => {
    loadEntities();
  }, []);

  const closeModal = () => setShow(false);
  const showModal = (id?: number) => {
    let p;
    if (id) {
      p = findById(id, entities);
    }

    setEntity(p ? p : new Principal());
    setShow(true);
  };
  const addEntity = () => {
    fetch('http://localhost:5290/v1/principals', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(entity)
    })
      .then(parseResponse)
      .then(() => {
        loadEntities();
        closeModal();
      });
  };
  const editEntity = () => {
    fetch('http://localhost:5290/v1/principals/' + entity.id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(entity)
    })
      .then(parseResponse)
      .then(() => {
        loadEntities();
        closeModal();
      });
  };
  const removeEntity = (id: number) => {
    fetch('http://localhost:5290/v1/principals/' + id, {
      method: "DELETE"
    })
      .then(parseResponse)
      .then(loadEntities);
  };
  const saveEntity = () => {
    entity.id ? editEntity() : addEntity();
  };

  return (
    <div className="mx-auto pt-5" style={{ "width": "800px" }}>
      <h2>Principal List</h2>
      <Table hover>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Username</th>
            <th scope="col">Email</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {entities && entities.map(p => <tr key={p.id}>
            <td>{p.id}</td>
            <td>{p.username}</td>
            <td>{p.email}</td>
            <td>
              <Button className="mx-2" variant="outline-primary" onClick={() => showModal(p.id)}>Edit</Button>
              <Button className="mx-2" variant="outline-danger" onClick={() => removeEntity(p.id)}>Delete</Button>
            </td>
          </tr>)}
        </tbody>
      </Table>

      <Button variant="primary" onClick={() => showModal()}>
        Add
      </Button>

      <Modal show={show} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{entity.id ? "Edit" : "Add"} Principal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {
              entity.id && <Form.Group className="mb-3">
                <Form.Label>ID</Form.Label>
                <Form.Control value={entity.id} readOnly />
              </Form.Group>
            }
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control value={entity?.username} onChange={(e) => {
                setEntity({ ...entity, username: e.target.value });
              }} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Email</Form.Label>
              <Form.Control value={entity?.email} onChange={(e) => {
                setEntity({ ...entity, email: e.target.value });
              }} />
            </Form.Group>
            {
              entity.id && <Form.Group className="mb-3">
                <Form.Label>Created Date</Form.Label>
                <Form.Control value={Moment(entity.createdDate).format('D MMM yyyy H:mm:ss')} readOnly />
              </Form.Group>
            }
            {
              entity.id && <Form.Group className="mb-3">
                <Form.Label>Updated Date</Form.Label>
                <Form.Control value={Moment(entity.createdDate).format('D MMM yyyy H:mm:ss')} readOnly />
              </Form.Group>
            }
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button variant="primary" onClick={saveEntity}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
