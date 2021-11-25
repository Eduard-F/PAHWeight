import { enablePromise, openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';
import { models } from '../models/model';

const tableName = 'weightData';


enablePromise(true);

export const getDBConnection = async () => {
  return openDatabase({ name: 'weight-data.db', location: 'default' });
};

export const checkCreateTables = async (db) => {
  // create table if not exists
  var query
  for (var table1 of Object.keys(models)) {
    query = `CREATE TABLE IF NOT EXISTS ${table1} (`
    for (var field of Object.keys(models[table1])) {
      query += `${field} ${models[table1][field]}, `
    }
    query = query.slice(0,-2)
    query += `);`
    await db.executeSql(query);
  }
};

async function dbFetchPromise(db, sql) {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(tx => {
        tx.executeSql(sql, [], (tx, results) => {
          const { rows } = results;
          let res = [];
          for (let i = 0; i < rows.length; i++) {
            res.push({
              ...rows.item(i),
            });
          }
          resolve(res);
        });
      });
    } catch (error) {
      reject(error)
    }
  });
}

export const getLastSync = async (db) => {
  try {
    var res = await dbFetchPromise(db, `SELECT LastSync FROM config`);
    return res
  } catch (error) {
    console.error(error);
    throw Error('Failed to get LastSync !!!');
  }
};

export const getConfigItems = async (db) => {
  try {
    // return await dbFetchPromise(db, `SELECT * FROM config`);
    return '123'
  } catch (error) {
    console.error(error);
    throw Error('Failed to get configItems !!!');
  }
};

export const saveConfigItems = async (db, configItems) => {
  if (configItems.length) {
    var headers = []
    for (var i of Object.keys(configItems[0])){
      if (models.config.hasOwnProperty(i)) {
        headers.push(i)
      }
    }
    var insertQuery = `INSERT OR REPLACE INTO config (${headers}) values `
    for (var j of configItems) {
      insertQuery += `(`
      for (var k of headers) {
        insertQuery += `${j[k]}, `
      }
      insertQuery = insertQuery.slice(0,-2)
      insertQuery += `), `
    }
    insertQuery = insertQuery.slice(0,-2)
    await db.executeSql(insertQuery);
  }
  return configItems
};

export const updateConfigItems = async (db, configItems) => {
  if (configItems.length) {
    var headers = []
    for (var i of Object.keys(configItems[0])){
      if (models.config.hasOwnProperty(i)) {
        headers.push(i)
      }
    }
    var insertQuery = `INSERT OR REPLACE INTO config (${headers}) values `
    for (var j of configItems) {
      insertQuery += `(`
      for (var k of headers) {
        insertQuery += `'${j[k]}', `
      }
      insertQuery = insertQuery.slice(0,-2)
      insertQuery += `), `
    }
    insertQuery = insertQuery.slice(0,-2)
    await db.executeSql(insertQuery);
  }
}


export const getWeightItems = async (db) => {
  try {
    return await dbFetchPromise(db, `SELECT * FROM weight`);
  } catch (error) {
    console.error(error);
    throw Error('Failed to get weightItems !!!');
  }
};

export const searchWeightItems = async (db) => {
  try {
    return await dbFetchPromise(db, `SELECT * FROM weight WHERE ServerDateUTC = 0`);
  } catch (error) {
    console.error(error);
    throw Error('Failed to search weightItems !!!');
  }
};

export const saveWeightItems = async (weightItems) => {
  const db1 = await getDBConnection()
  if (weightItems.length) {
    var headers = []
    for (var i of Object.keys(weightItems[0])){
      if (models.weight.hasOwnProperty(i)) {
        headers.push(i)
      }
    }
    var insertQuery = `INSERT OR REPLACE INTO weight (${headers}) values `
    for (var j of weightItems) {
      insertQuery += `(`
      for (var k of headers) {
        insertQuery += `'${j[k]}', `
      }
      insertQuery = insertQuery.slice(0,-2)
      insertQuery += `), `
    }
    insertQuery = insertQuery.slice(0,-2)
    await db1.executeSql(insertQuery);
  }
};

export const deleteWeightItem = async (db, id) => {
  const deleteQuery = `DELETE from weight where id = ${id}`;
  await db.executeSql(deleteQuery);
};

export const updateWeightItems = async (db, weightItems) => {
  if (weightItems.length) {
    var headers = []
    for (var i of Object.keys(weightItems[0])){
      if (models.weight.hasOwnProperty(i)) {
        headers.push(i)
      }
    }
    var insertQuery = `INSERT OR REPLACE INTO weight (${headers}) values `
    for (var j of weightItems) {
      insertQuery += `(`
      for (var k of headers) {
        insertQuery += `'${j[k]}', `
      }
      insertQuery = insertQuery.slice(0,-2)
      insertQuery += `), `
    }
    insertQuery = insertQuery.slice(0,-2)
    await db.executeSql(insertQuery);
  }
}


export const getEmployeeItems = async (db) => {
  try {
    return await dbFetchPromise(db, `SELECT EmployeeID AS id, Firstname || ' ' || Surname AS value, Termdate FROM employee WHERE DeletedDateUTC = 0 AND Supervisor = 0 AND Termdate = 'null'`);
  } catch (error) {
    console.error(error);
    throw Error('Failed to get employeeItems !!!');
  }
};

export const searchEmployeeItems = async (db, rfid) => {
  try {
    const employeeItems = [];
    const results = await db.executeSql(`SELECT EmployeeID AS id, CONCAT(Firstname, ' ', Surname) AS value, RfidCode, Supervisor FROM employee where RfidCode = '${rfid}'`);
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        employeeItems.push(result.rows.item(index))
      }
    });
    return employeeItems;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get employeeItems !!!');
  }
};

export const saveEmployeeItems = async (db, employeeItems, updated) => {
  if (employeeItems.length) {
    var headers = []
    for (var i of Object.keys(employeeItems[0])){
      if (models.employee.hasOwnProperty(i)) {
        headers.push(i)
      }
    }
    var insertQuery = `INSERT OR REPLACE INTO employee (${headers}) values `
    for (var j of employeeItems) {
      if (j.UpdatedDateUTC > updated) {updated = j.UpdatedDateUTC}
      insertQuery += `(`
      for (var k of headers) {
        insertQuery += `'${j[k]}', `
      }
      insertQuery = insertQuery.slice(0,-2)
      insertQuery += `), `
    }
    insertQuery = insertQuery.slice(0,-2)
    await db.executeSql(insertQuery);
  }
  return updated
};

export const deleteEmployeeItem = async (db, id) => {
  const deleteQuery = `DELETE from employee where id = ${id}`;
  await db.executeSql(deleteQuery);
};


export const getFieldItems = async (db) => {
  try {
    return await dbFetchPromise(db, `SELECT AreaID AS id, '(' || Title || ') ' || Description AS value FROM field WHERE DeletedDateUTC = 0`);
  } catch (error) {
    console.error(error);
    throw Error('Failed to get fieldItems !!!');
  }
};

export const saveFieldItems = async (db, fieldItems, updated) => {
  if (fieldItems.length) {
    var headers = []
    for (var i of Object.keys(fieldItems[0])){
      if (models.field.hasOwnProperty(i)) {
        headers.push(i)
      }
    }
    var insertQuery = `INSERT OR REPLACE INTO field (${headers}, Variety, VarietyID) values `
    for (var j of fieldItems) {
      if (j.UpdatedDateUTC > updated) {updated = j.UpdatedDateUTC}
      insertQuery += `(`
      for (var k of headers) {
        insertQuery += `'${j[k]}', `
      }
      insertQuery += `'${j['Data']['Variety']}', '${j['Data']['VarietyID']}', `
      insertQuery = insertQuery.slice(0,-2)
      insertQuery += `), `
    }
    insertQuery = insertQuery.slice(0,-2)
    await db.executeSql(insertQuery);
  }
  return updated
};

export const deleteFieldtItem = async (db, id) => {
  const deleteQuery = `DELETE FROM field WHERE AreaID = '${id}'`;
  await db.executeSql(deleteQuery);
};


export const getAssetItems = async (db) => {
  try {
    return await dbFetchPromise(db, `SELECT AssetID AS id, '(' || AssetNumber || ') ' || AssetDescription AS value FROM asset WHERE DeletedDateUTC = 0`);
  } catch (error) {
    console.error(error);
    throw Error('Failed to get assetItems !!!');
  }
};

export const saveAssetItems = async (db, assetItems, updated) => {
  if (assetItems.length) {
    var headers = []
    for (var i of Object.keys(assetItems[0])){
      if (models.asset.hasOwnProperty(i)) {
        headers.push(i)
      }
    }
    var insertQuery = `INSERT OR REPLACE INTO asset (${headers}) values `
    for (var j of assetItems) {
      if (j.UpdatedDateUTC > updated) {updated = j.UpdatedDateUTC}
      insertQuery += `(`
      for (var k of headers) {
        insertQuery += `'${j[k]}', `
      }
      insertQuery = insertQuery.slice(0,-2)
      insertQuery += `), `
    }
    insertQuery = insertQuery.slice(0,-2)
    await db.executeSql(insertQuery);
  }
  return updated
};

export const deleteAssetItem = async (db, id) => {
  const deleteQuery = `DELETE from asset where id = ${id}`;
  await db.executeSql(deleteQuery);
};


export const getDeviceItems = async (db) => {
  try {
    return await dbFetchPromise(db, `SELECT * FROM device`);
  } catch (error) {
    console.error(error);
    throw Error('Failed to get deviceItems !!!');
  }
};

export const saveDeviceItems = async (db, deviceItems) => {
  if (deviceItems.length) {
    console.log('saveDeviceItems')
    var headers = []
    for (var i of Object.keys(deviceItems[0])){
      if (models.device.hasOwnProperty(i)) {
        headers.push(i)
      }
    }
    var insertQuery = `INSERT OR REPLACE INTO device (${headers}) values `
    for (var j of deviceItems) {
      insertQuery += `(`
      for (var k of headers) {
        if (models.device[k].substring(0, 7) == 'INTEGER') {
          insertQuery += `${j[k]}, `
        } else {
          insertQuery += `'${j[k]}', `
        }
      }
      insertQuery = insertQuery.slice(0,-2)
      insertQuery += `), `
    }
    insertQuery = insertQuery.slice(0,-2)
    
    await db.executeSql(insertQuery);
  }
};

export const deleteDeviceItem = async (db, id) => {
  const deleteQuery = `DELETE from device where id = ${id}`;
  await db.executeSql(deleteQuery);
};

export const deleteTable = async (db, table) => {
  const query = `drop table ${table}`;

  await db.executeSql(query);
};