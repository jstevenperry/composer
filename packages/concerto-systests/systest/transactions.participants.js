/*
 * IBM Confidential
 * OCO Source Materials
 * IBM Concerto - Blockchain Solution Framework
 * Copyright IBM Corp. 2016
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has
 * been deposited with the U.S. Copyright Office.
 */

'use strict';

const BusinessNetworkDefinition = require('@ibm/concerto-admin').BusinessNetworkDefinition;

const fs = require('fs');
const path = require('path');

const TestUtil = require('./testutil');
const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));


describe('Transaction (participant specific) system tests', () => {

    let businessNetworkDefinition;
    let admin;
    let client;

    before(function () {
        const modelFiles = [
            fs.readFileSync(path.resolve(__dirname, 'data/transactions.participants.cto'), 'utf8')
        ];
        const scriptFiles=  [
            { identifier: 'transactions.participants.js', contents: fs.readFileSync(path.resolve(__dirname, 'data/transactions.participants.js'), 'utf8') }
        ];
        businessNetworkDefinition = new BusinessNetworkDefinition('systest.transactions.participants@0.0.1', 'The network for the transaction system tests');
        modelFiles.forEach((modelFile) => {
            businessNetworkDefinition.getModelManager().addModelFile(modelFile);
        });
        scriptFiles.forEach((scriptFile) => {
            let scriptManager = businessNetworkDefinition.getScriptManager();
            scriptManager.addScript(scriptManager.createScript(scriptFile.identifier, 'JS', scriptFile.contents));
        });
        admin = TestUtil.getAdmin();
        return admin.deploy(businessNetworkDefinition)
            .then(() => {
                return TestUtil.getClient('systest.transactions.participants')
                    .then((result) => {
                        client = result;
                    });
            });
    });

    it('should submit and execute a transaction that contains participants', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let transaction = factory.newTransaction('systest.transactions.participants', 'SimpleTransactionWithParticipants');
        transaction.stringParticipant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        transaction.stringParticipant.stringValue = 'party parrot in hursley';
        transaction.integerParticipant = factory.newInstance('systest.transactions.participants', 'SimpleIntegerParticipant', 'integerParticipant1');
        transaction.integerParticipant.integerValue = 5318008;
        return client.submitTransaction(transaction);
    });

    it('should submit and execute a transaction that contains arrays of participants', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let transaction = factory.newTransaction('systest.transactions.participants', 'SimpleTransactionWithParticipantArrays');
        transaction.stringParticipants = [
            factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1'),
            factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant2')
        ];
        transaction.stringParticipants[0].stringValue = 'party parrot in hursley';
        transaction.stringParticipants[1].stringValue = 'party parrot in san francisco';
        transaction.integerParticipants = [
            factory.newInstance('systest.transactions.participants', 'SimpleIntegerParticipant', 'integerParticipant1'),
            factory.newInstance('systest.transactions.participants', 'SimpleIntegerParticipant', 'integerParticipant2')
        ];
        transaction.integerParticipants[0].integerValue = 5318008;
        transaction.integerParticipants[1].integerValue = 56373351;
        return client.submitTransaction(transaction);
    });

    it('should submit and execute a transaction that contains relationships to participants', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let stringParticipant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        stringParticipant.stringValue = 'party parrot in hursley';
        let integerParticipant = factory.newInstance('systest.transactions.participants', 'SimpleIntegerParticipant', 'integerParticipant1');
        integerParticipant.integerValue = 5318008;
        let transaction = factory.newTransaction('systest.transactions.participants', 'SimpleTransactionWithParticipantRelationships');
        transaction.stringParticipant = factory.newRelationship('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        transaction.integerParticipant = factory.newRelationship('systest.transactions.participants', 'SimpleIntegerParticipant', 'integerParticipant1');
        return client
            .getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.add(stringParticipant);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleIntegerParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.add(integerParticipant);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            });
    });

    it('should submit and report a failure for a transaction that contains an invalid relationship to an participant', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let transaction = factory.newTransaction('systest.transactions.participants', 'SimpleTransactionWithParticipantRelationships');
        transaction.stringParticipant = factory.newRelationship('systest.transactions.participants', 'SimpleStringParticipant', 'I DONT EXIST');
        transaction.integerParticipant = factory.newRelationship('systest.transactions.participants', 'SimpleIntegerParticipant', 'I DONT EXIST EITHER');
        return client
            .submitTransaction(transaction)
            .should.be.rejected;
    });

    it('should submit and execute a transaction that contains arrays of relationships to participants', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let stringParticipant1 = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        stringParticipant1.stringValue = 'party parrot in hursley';
        let stringParticipant2 = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant2');
        stringParticipant2.stringValue = 'party parrot in san francisco';
        let integerParticipant1 = factory.newInstance('systest.transactions.participants', 'SimpleIntegerParticipant', 'integerParticipant1');
        integerParticipant1.integerValue = 5318008;
        let integerParticipant2 = factory.newInstance('systest.transactions.participants', 'SimpleIntegerParticipant', 'integerParticipant2');
        integerParticipant2.integerValue = 56373351;
        let transaction = factory.newTransaction('systest.transactions.participants', 'SimpleTransactionWithParticipantRelationshipArrays');
        transaction.stringParticipants = [
            factory.newRelationship('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1'),
            factory.newRelationship('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant2')
        ];
        transaction.integerParticipants = [
            factory.newRelationship('systest.transactions.participants', 'SimpleIntegerParticipant', 'integerParticipant1'),
            factory.newRelationship('systest.transactions.participants', 'SimpleIntegerParticipant', 'integerParticipant2')
        ];
        return client
            .getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.addAll([stringParticipant1, stringParticipant2]);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleIntegerParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.addAll([integerParticipant1, integerParticipant2]);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            });
    });

    it('should submit and execute a transaction that gets all participants from an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let participant1 = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        participant1.stringValue = 'party parrot in hursley';
        let participant2 = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant2');
        participant2.stringValue = 'party parrot in san francisco';
        let transaction = factory.newTransaction('systest.transactions.participants', 'GetAllParticipantsFromParticipantRegistryTransaction');
        return client
            .getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.add(participant1);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.add(participant2);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            });
    });

    it('should submit and execute a transaction that gets an participant from an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let participant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        participant.stringValue = 'party parrot in hursley';
        let transaction = factory.newTransaction('systest.transactions.participants', 'GetParticipantFromParticipantRegistryTransaction');
        return client
            .getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.add(participant);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            });
    });

    it('should submit and execute a transaction that adds an participant in the transaction to an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let transaction = factory.newTransaction('systest.transactions.participants', 'AddParticipantInTransactionToParticipantRegistryTransaction');
        transaction.stringParticipant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        transaction.stringParticipant.stringValue = 'party parrot in hursley';
        return client
            .submitTransaction(transaction)
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('stringParticipant1');
            })
            .then((participant) => {
                participant.getIdentifier().should.equal('stringParticipant1');
                participant.stringValue.should.equal('party parrot in hursley');
            });
    });

    it('should submit and execute a transaction that adds an participant with a relationship in the transaction to an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let transaction = factory.newTransaction('systest.transactions.participants', 'AddParticipantWithRelationshipInTransactionToParticipantRegistryTransaction');
        let stringParticipant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        stringParticipant.stringValue = 'party parrot in hursley';
        let relationshipParticipant = factory.newInstance('systest.transactions.participants', 'SimpleRelationshipParticipant', 'relationshipParticipant1');
        relationshipParticipant.stringParticipant = factory.newRelationship('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        transaction.relationshipParticipant = relationshipParticipant;
        return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.add(stringParticipant);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleRelationshipParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('relationshipParticipant1');
            })
            .then((participant) => {
                participant.getIdentifier().should.equal('relationshipParticipant1');
                participant.stringParticipant.isRelationship().should.be.true;
                participant.stringParticipant.getFullyQualifiedIdentifier().should.equal('systest.transactions.participants.SimpleStringParticipant#stringParticipant1');
            });
    });

    it('should submit and execute a transaction that adds a new participant to an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let transaction = factory.newTransaction('systest.transactions.participants', 'AddNewParticipantToParticipantRegistryTransaction');
        return client
            .submitTransaction(transaction)
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('stringParticipant1');
            })
            .then((participant) => {
                participant.getIdentifier().should.equal('stringParticipant1');
                participant.stringValue.should.equal('party parrot in hursley');
            });
    });

    it('should submit and execute a transaction that adds a new participant with a relationship to an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let transaction = factory.newTransaction('systest.transactions.participants', 'AddNewParticipantWithRelationshipToParticipantRegistryTransaction');
        let stringParticipant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        stringParticipant.stringValue = 'party parrot in hursley';
        return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.add(stringParticipant);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleRelationshipParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('relationshipParticipant1');
            })
            .then((participant) => {
                participant.getIdentifier().should.equal('relationshipParticipant1');
                participant.stringParticipant.isRelationship().should.be.true;
                participant.stringParticipant.getFullyQualifiedIdentifier().should.equal('systest.transactions.participants.SimpleStringParticipant#stringParticipant1');
            });
    });

    it('should submit and execute a transaction that updates an participant in the transaction in an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let participant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        participant.stringValue = 'party parrot in hursley';
        let transaction = factory.newTransaction('systest.transactions.participants', 'UpdateParticipantInTransactionInParticipantRegistryTransaction');
        transaction.stringParticipant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        transaction.stringParticipant.stringValue = 'party parrot in san francisco';
        return client
            .getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.add(participant);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('stringParticipant1');
            })
            .then((participant) => {
                participant.getIdentifier().should.equal('stringParticipant1');
                participant.stringValue.should.equal('party parrot in san francisco');
            });
    });

    it('should submit and execute a transaction that updates an participant with a relationship in the transaction in an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let transaction = factory.newTransaction('systest.transactions.participants', 'UpdateParticipantWithRelationshipInTransactionInParticipantRegistryTransaction');
        let stringParticipant1 = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        stringParticipant1.stringValue = 'party parrot in hursley';
        let stringParticipant2 = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant2');
        stringParticipant2.stringValue = 'party parrot in hursley';
        let relationshipParticipant = factory.newInstance('systest.transactions.participants', 'SimpleRelationshipParticipant', 'relationshipParticipant1');
        relationshipParticipant.stringParticipant = factory.newRelationship('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        transaction.relationshipParticipant = relationshipParticipant;
        return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.addAll([stringParticipant1, stringParticipant2]);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleRelationshipParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.add(relationshipParticipant);
            })
            .then(() => {
                relationshipParticipant.stringParticipant = factory.newRelationship('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant2');
                transaction.relationshipParticipant = relationshipParticipant;
                return client.submitTransaction(transaction);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleRelationshipParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('relationshipParticipant1');
            })
            .then((participant) => {
                participant.getIdentifier().should.equal('relationshipParticipant1');
                participant.stringParticipant.isRelationship().should.be.true;
                participant.stringParticipant.getFullyQualifiedIdentifier().should.equal('systest.transactions.participants.SimpleStringParticipant#stringParticipant2');
            });
    });

    it('should submit and execute a transaction that updates a new participant in an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let participant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        participant.stringValue = 'party parrot in hursley';
        let transaction = factory.newTransaction('systest.transactions.participants', 'UpdateNewParticipantInParticipantRegistryTransaction');
        return client
            .getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.add(participant);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('stringParticipant1');
            })
            .then((participant) => {
                participant.getIdentifier().should.equal('stringParticipant1');
                participant.stringValue.should.equal('party parrot in san francisco');
            });
    });

    it('should submit and execute a transaction that updates a new participant with a relationship in an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let transaction = factory.newTransaction('systest.transactions.participants', 'UpdateNewParticipantWithRelationshipToParticipantRegistryTransaction');
        let stringParticipant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        stringParticipant.stringValue = 'party parrot in hursley';
        let relationshipParticipant = factory.newInstance('systest.transactions.participants', 'SimpleRelationshipParticipant', 'relationshipParticipant1');
        relationshipParticipant.stringParticipant = factory.newRelationship('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.add(stringParticipant);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleRelationshipParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.add(relationshipParticipant);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleRelationshipParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('relationshipParticipant1');
            })
            .then((participant) => {
                participant.getIdentifier().should.equal('relationshipParticipant1');
                participant.stringParticipant.isRelationship().should.be.true;
                participant.stringParticipant.getFullyQualifiedIdentifier().should.equal('systest.transactions.participants.SimpleStringParticipant#stringParticipant2');
            });
    });

    it('should submit and execute a transaction that removes an participant in the transaction from an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let participant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        participant.stringValue = 'party parrot in hursley';
        let transaction = factory.newTransaction('systest.transactions.participants', 'RemoveParticipantInTransactionInParticipantRegistryTransaction');
        transaction.stringParticipant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        transaction.stringParticipant.stringValue = 'party parrot in san francisco';
        return client
            .getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.add(participant);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('stringParticipant1');
            })
            .then((participant) => {
                throw new Error('should not get here');
            })
            .catch((error) => {
                error.should.match(/Object with ID '.+?' in collection with ID '.+?' does not exist/);
            });
    });

    it('should submit and execute a transaction that removes an participant with a relationship in the transaction from an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let transaction = factory.newTransaction('systest.transactions.participants', 'RemoveParticipantWithRelationshipInTransactionInParticipantRegistryTransaction');
        let stringParticipant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        stringParticipant.stringValue = 'party parrot in hursley';
        let relationshipParticipant = factory.newInstance('systest.transactions.participants', 'SimpleRelationshipParticipant', 'relationshipParticipant1');
        relationshipParticipant.stringParticipant = factory.newRelationship('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        transaction.relationshipParticipant = relationshipParticipant;
        return client
            .getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.add(stringParticipant);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleRelationshipParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.add(relationshipParticipant);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleRelationshipParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('relationshipParticipant1');
            })
            .then((participant) => {
                throw new Error('should not get here');
            })
            .catch((error) => {
                error.should.match(/Object with ID '.+?' in collection with ID '.+?' does not exist/);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('stringParticipant1');
            });
    });

    it('should submit and execute a transaction that removes a new participant from an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let participant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        participant.stringValue = 'party parrot in hursley';
        let transaction = factory.newTransaction('systest.transactions.participants', 'RemoveNewParticipantInParticipantRegistryTransaction');
        return client
            .getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.add(participant);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('stringParticipant1');
            })
            .then((participant) => {
                throw new Error('should not get here');
            })
            .catch((error) => {
                error.should.match(/Object with ID '.+?' in collection with ID '.+?' does not exist/);
            });
    });

    it('should submit and execute a transaction that removes a new participant with a relationship from an participant registry', () => {
        let factory = client.getBusinessNetwork().getFactory();
        let transaction = factory.newTransaction('systest.transactions.participants', 'RemoveNewParticipantWithRelationshipInParticipantRegistryTransaction');
        let stringParticipant = factory.newInstance('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        stringParticipant.stringValue = 'party parrot in hursley';
        let relationshipParticipant = factory.newInstance('systest.transactions.participants', 'SimpleRelationshipParticipant', 'relationshipParticipant1');
        relationshipParticipant.stringParticipant = factory.newRelationship('systest.transactions.participants', 'SimpleStringParticipant', 'stringParticipant1');
        return client
            .getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant')
            .then((participantRegistry) => {
                return participantRegistry.add(stringParticipant);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleRelationshipParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.add(relationshipParticipant);
            })
            .then(() => {
                return client.submitTransaction(transaction);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleRelationshipParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('relationshipParticipant1');
            })
            .then((participant) => {
                throw new Error('should not get here');
            })
            .catch((error) => {
                error.should.match(/Object with ID '.+?' in collection with ID '.+?' does not exist/);
            })
            .then(() => {
                return client.getParticipantRegistry('systest.transactions.participants.SimpleStringParticipant');
            })
            .then((participantRegistry) => {
                return participantRegistry.get('stringParticipant1');
            });
    });

});
