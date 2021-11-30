import React, { useState, useEffect } from 'react';
import { Button } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { getDBConnection, searchEmployeeItems, searchAssetItems } from "../services/db-service";

const QRCodeScreen = ({ route, navigation }) => {
    const [flash, setFlash] = useState(false);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button onPress={() => setFlash(c => !c)} title="toggle flash" />
            ),
        });
    }, [navigation]);

    async function onSuccess(e) {
        if (e.data) {
            const db = await getDBConnection();
            var res
            if (route.params?.child_model == 'employee') {
                res = await searchEmployeeItems(db, e.data);
            } else if (route.params?.child_model == 'asset') {
                res = await searchAssetItems(db, e.data);
            }
            if (res.length) {
                navigation.navigate('Weight', {
                    child_model: route.params?.child_model,
                    child_id: res[0].id,
                    child_value: res[0].value,
                    qr_code: true
                })
            }
        }
    };

    return (
        <QRCodeScanner
            onRead={onSuccess}
            flashMode={
                flash ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off
            }
            showMarker={true}
        />
    );
}

module.exports = { QRCodeScreen };