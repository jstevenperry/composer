(cat > composer.sh; chmod +x composer.sh; exec bash composer.sh)
#!/bin/bash
set -ev

# Get the current directory.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Get the full path to this script.
SOURCE="${DIR}/composer.sh"

# Create a work directory for extracting files into.
WORKDIR="$(pwd)/composer-data"
rm -rf "${WORKDIR}" && mkdir -p "${WORKDIR}"
cd "${WORKDIR}"

# Find the PAYLOAD: marker in this script.
PAYLOAD_LINE=$(grep -a -n '^PAYLOAD:$' "${SOURCE}" | cut -d ':' -f 1)
echo PAYLOAD_LINE=${PAYLOAD_LINE}

# Find and extract the payload in this script.
PAYLOAD_START=$((PAYLOAD_LINE + 1))
echo PAYLOAD_START=${PAYLOAD_START}
tail -n +${PAYLOAD_START} "${SOURCE}" | tar -xzf -

# Pull the latest Docker images from Docker Hub.
docker-compose pull
docker pull hyperledger/fabric-ccenv:x86_64-1.0.0-alpha

# Kill and remove any running Docker containers.
docker-compose -p composer kill
docker-compose -p composer down --remove-orphans

# Kill any other Docker containers.
docker ps -aq | xargs docker rm -f

# Start all Docker containers.
docker-compose -p composer up -d

# Wait for the Docker containers to start and initialize.
sleep 10

# Create the channel on peer0.
docker exec peer0 peer channel create -o orderer0:7050 -c mychannel -f /etc/hyperledger/configtx/mychannel.tx

# Join peer0 to the channel.
docker exec peer0 peer channel join -b mychannel.block

# Fetch the channel block on peer1.
docker exec peer1 peer channel fetch -o orderer0:7050 -c mychannel

# Join peer1 to the channel.
docker exec peer1 peer channel join -b mychannel.block

# Open the playground in a web browser.
case "$(uname)" in 
"Darwin") open http://localhost:8080
          ;;
"Linux")  if [ -n "$BROWSER" ] ; then
	       	        $BROWSER http://localhost:8080
	        elif    which xdg-open > /dev/null ; then
	                xdg-open http://localhost:8080
          elif  	which gnome-open > /dev/null ; then
	                gnome-open http://localhost:8080
          #elif other types blah blah
	        else   
    	            echo "Could not detect web browser to use - please launch Composer Playground URL using your chosen browser ie: <browser executable name> http://localhost:8080 or set your BROWSER variable to the browser launcher in your PATH"
	        fi
          ;;
*)        echo "Playground not launched - this OS is currently not supported "
          ;;
esac

# Exit; this is required as the payload immediately follows.
exit 0
PAYLOAD:
� ~�$Y �]Ys�:�g�
j^��xߺ��F���6�`��R�ٌ���c Ig�tB:��[�/�$!�:���Q����u|���`�_>H�&�W�&���;|Aq�#� (����9�y�M���Z��:�����r���C�>���i7���`���2��q��)�@*���������@�X�B�J�%���?�x�:�\�(I`������{�+��[G���'�j���_����g�8�_�˟�i�������t�eؙ.�t���)�����k��GcAQ����:�ԞG���럕{-�����4B�����yNٔK�(]Lb�b��q�e����Q��HsmǣHE��o��{~�2������I���ǋl�K)��p�u'6d�&�B�z�lC��E�)M��(�2�I}a,0���F)�[e�ւ6U�	�e���i�ϯ}�`!���x�	Z��Աc���#��sݧ(��h��:���OYz8�l%�n���Ri&������Ł��"�-T?�%�^|��}��+��K��ww�o�_���M�����^n�QY�������]����u�G���G	{��q��������Eݐ%�/���e�i�<p�!�e���,%>���-3�x�\���2@���d>��4M 3.T�,�x�LMk�y�DC)nЁ�sJ[ä���nD&�!N;�q;E`�F�{��3{�Μ��+�9x��n�\�sv?>�;� =.TM(���Q��F�N�$"�J��Q�x$r�&���}Zn	bG�s&
o��N< :��\�8�E�୍=w��y�!�Eޔk��������VA�7Ks!?�� �|<4��Z*7V8���ϴ	B�D���MA� ����J��7�v}1ߍ$2%�F�4���5Vl�Z�:����6��Y�J.�\���+-5���Q��Δn�Z�lt�<����\��\�"Of�w�f��y4�P?�����saI
&oE�#]��EY�.2&����N�yX12[�FѦI����(�7͕��d(D�$�8�e�G �C'r����"�.a�E��,��~����a�];�Cn9I[RMM/F]}�d	�,�9�x�,z�4����������gf9�%��M�7��{��*�/$�G�Om�W�}��XaT�_^�qV�����#ü�ީ��.Yo	$��-����9ǉP�1�%�
��Q�N����٩pP��*�*Hv�Vp?�+3�>M�� ��,,LCѕ�&�,�`w�8b�N��(��K���s԰�D�/['RS�w�йY��f�Ǧ�{E��bn5o;�p��;P �{�-C���O�e虻l�S�r!<QuhM���ãr����)gF���Y ���@��O��8^���X{x�gB��Z���C]��;����6%�|�H�9��A�A�9lQ��Qt�f��LH��5>�8�hQ�y��k�_
r���M��X����sS��gr]K���m3�>�P�0Y����O�K�ߵ������IV���C��3���{�������@��W�������/��7�^���G�W�_~I���S�������~}��>E8�b�P6[\� �H��u���@X$�q��\֡0�\�P��Y������e����G�?�V�_� ��o���~�Ѥ���#��u�u<K�s�G ��e�?�����-ض�`FL�9i��e�l)�z�"��Ɨs�3ܠ��Ȃ�`�͍9�Z�+���u�`5J�`�Y��4��ދ_����S����������P��/��_��W��U������S�)� �?J������+o�����o�Px$t�0�7[� -x�������]>tl�0�ެ���31��B���d�{*��< }d�ex�I&��T�[ӹg�6|�=̝�*"��"	s=����z���dް��1�?M�B�x��	����NV�;�g���5�H��q9#�����@~���-�A�%�S�q�s ��l(bK Ӑ���s'������m�2	\X�7h�y��磅iϞ�P���I`*����;����C���b��v�in��:K{��,�;�!/7;��
�(!�D��|$s�"yY��	���@N�b�Ak����S����������|��?#����RP����_���=�f����>�r�G�T�_.��+4�".��(�V�_*������?����?�zl h��T�e����t���GC�'��]����p�����Q�a	�DX�qX$@H�Ei�$)�����P��/��C�B]T�_	� �Oe®ȯV+U���؜����=�i�m����?��)���H�	�S����;����^����=��n�c�Vi�ہ�8"��	�y� ���`�ʇ7y��)%�v�Y��n<��q������ӿ��K���=���c�����.����eJ�r��U��R�^�?H�}��r�\�4�Q����G�����˿xMW�K���������t��S>e��4B�?��9�m�.cS,���x.����a�G#�n�8K0A��6˰>Z-��2�������>��t����0Qx1�v�z���`�]��c��F����_\�Yh����8��u��RTO�È�<j̄�]��kF�A��!�Sn;�"l�z&⚠:����l�Z�y7>r�����AV�_)��?�$���W�_���� ��h�
e���b���i�7Q��2�Z�W���������]���X��a���ǳ�>�Y@���g�ݏ��{P����]P�z�F��=tw��ρnX�΁���~�9�Ѓ��6��2q�p��N�}1/�.���G��&1]���&�����k��4�Gx,�3��gr�CMf=Q'���7G����Q[x+.�K����Dӭ3�YO>�#ܖ�Q�2��8��n�u_;ms.���k ��ݚ�r.k)ZV�y:E��ڔ�9��t��nw�cC��B�w{�C ����䶷�<����à�bM p"�r65�y{WW\����Vd���Fg9�,3�V�֟��A��߃ j�;%6�NГr�&{+~f��ni���p�5��!��x����/m���c��_
~���+��o�����Vn�o�2�����l�'������m�?���?�m�a��o��N2;M�p�g�?���qo(�g���@y�@wA޺d�d����5`�5M|��?�O΃���ɡ���-*�;��5Y/��Z�o�JOM���C|k�r�Z��0�SٌI2��u��(�Z"��r��դ��y��!�~��܇.���� ��Y>h��@�Dk�<�w�u7��+e0��j.uq�?%s9��V{f��!Wk����=h�t�0B��G�P��a�?������/q����d�W
~��|�Q��)	�1����ʐ�{�����Y����j��Z�������7��w�s�������\.�˭�������,�W�_��������E=_�����\���G�4�a(�R�C�,�2��`���h��.��>J8d��T��>B�.�8�W���V(C���?:������Rp����Lɖ�þeN�6;}�!Bs�m�me�E��#mѢ&/��1ќ��J;�����(���)�G�  �mow���c�o]�5�Oaz���z8#P�249�P�7�+u�Ŧ=4����^������Qg��>Z|�=~>���f���(R}�W)��iVh������ (�������P�����R�M#;���&��O��1��t�^���C�P�z�\#W�"�ا����4����\�+�ծj�t����M����`��?����?=}0��u����I|=���)������ֲI�ʭ�����Q���U�r}\����ꝟ���}��\���_V���W�rj�_O���ڕw�m��D��>��/9���[�⶿�k{��ӛ��µo�*�������yZ�.��au[좱��Q�����:��t�!�@t����\�~^,}���"ͮ��(�׊Jr�#��Q����8���G�v��}��]t�~O�u�(޼ZZ���-����`{��ӿ)���ųڋ��=��e҂H��m��7����3�u=p�^��|�imz�k����?�ʾ���~>c�%��rQi�a�������|�o�i������^O�,u�p��l��Be�`�=�ڽV{��D:9*B�GJ��O�����G���-��⶧n��z8e���e.R|Wo�&�U�+�7�H��hȊ��أ�*��o�t�?N6�b�����6���+Ó8[�[;���>[R��É~�dO,�m1��?�㬢ڮ����6�u����r9<.��r�˘�b���u�K��tݺ�t�ֽoJ�=]�n�֞v��5!&��4�o4B�@�D?)����A	$D�`����ж�z��휝������������������y��y2����M���i���S�d��ERx6��z��F��L,u)���ønm��1�ѓ�5Y~3�/����n�LˁiVFǢK��0н@4�׀�}2��lnr��.&�o�aG[�UY���o�Ϳ�k�98Q7N���9䖙I�ú�n z)��6`��j���G���n+����6j��U� ����3���s�J���h2��n�B2MѺ�|b|�R������n�F8ZFL�5#��(���4b	�Y���F
�-��oֈ�9|r��xiȘeTx�oU�K��n5���h�,GS䃍��0�}��� mN�����L6��pz48���)�� ��w�������4�b|�\]������iU��=�s�g�w��&�Z����:��ӿ�e�M$�TҀő*�����3�é���sFO�T�x֜��H�2�4ҹ�+�5�o��]������C0��e�����C�|��.8�s����T��2��c����M�z�b����\4([T)E�������.לP�Օ��М���H���=����L��*�T����
��w�y>�'�����F�?I����ǜ�n��!3�%8��t�z1A3�6'f�a��;^k����!̕be仺j/Ɇ.�E�:|����Y^���,�:�'������ᇳO3xhToEt./���������v��*c��?n���g��j��g�y��J<
k'6N�=���~~��ZK%.<��T�~��U�&�Xdۋ��~?�ƶ�,�X�g�W���Q�U�G8�rzF9�I�{����~�3����[���x�7�/?��K���s�+x���n<AA?s�kƁp�N��;؍�C/޹�s�*���sз�AO�����������}z��}O��)���7�׳�y`D��{Q�K�Y�G�c=:��%�I�f�0�V���D��� C�w~�����2]�b���f��#��!xv�e��l�(�ϐn7�/D�����
m�Y@�����50_����N��4�/�(�����I;'���h�d���ћ9��-X
�D�mt�;��(L)�U8��D���,��1%:���E�`��ޚE!�Ig}%��L��JeO����(!�(�E���T�%Ą�g�RPR����URU�b�|�x���R��[/�(<˥��}�ӧl&�̈́����0a��D�퐁�Ծ���SGXkSOpHt�No������\	Y��!&8�Mהlč��x2�IJ�m"�]��q�kq��W6Q&���$*���FO�5�#���	�ن;�OH$@�p�J2��F��̴� H�ڑ��<|�C�=�3�c`sȊw"�09@���"B`��:hY!��b�X�GH�i�XM��0����J���=�.WM7�:���� E3|~��컍滯,�cR�%��(˖;���H�,��N�d0�݉���P@����׊���1�f�V�ʇ�b�%6�`!N�.���E�\YTAs�:����D絢DE�p!UM�>&�gZRjNY���.U����C�bM��$�u��*�r �a��D�r��7iGLe�Ŝw'����T�d��GrM����I�/��\U!p�U��"e�/P����R_AY�h��3�oU�<J�n?�%41t'��Pk���+i�oᅡ��0�D���N��V�U6��vPw�I4��p��5)6��^T�e��F��+�)s2�,{�gd�*ڄ�C���X�֧��*�to��{E�A����fn:��C� ~�!�;>"�ך*�&���S�{�b$��r$ܞd��`�S����>�����m����D�5���U�tn�JhZ�N�O�]�q�n�U����3���eo�ʳ��γ~�tQi�������uA�͉F�]�k��n���Y"w�3�ʛ��R�T��MЍ���x��K�(q�Np1�)�y���̯�6U����·���(<��'5Y�-'�֬M�6䡛��k`�ᇟC�>���j��ꜳЙ�� 0��~� n�<+�*f͡[��u�k��1u?��,�q´��).���ypW�/F>sz2+f�z�@t�'ʪ��L���Y ��f$}�Q��Y����GnE^�^��Z����{?���~)X�������Ik�A�EJ=S�b� ȷ��-�Vvn�A���ԑiK�E��Ѡa.:J�p�����,88q4�Q��
���t��"�{����H��p�CS�R�R�_$����(X��]�	�#�--���V����� �y�DP��#[L)��u�6Y��W�Ջ�`��=�*�F�`�@P��)0ZLP��	
i�?���4n�=jb8D,K�$S��CD��x&:����z+1�h��#�F��`�/���;��"]��+CoKAEg���8W�^�|�|cs�hC���T/&[��ER��GP]�6�� LR��r8+70}\�i�^:�����6�8l�8��u�zIwC��N�-S��i�;&�9&>ӊ9˳��C�u*���i+î�;��zX��������}Y<,;������:�d��#l��$�rW�$�c^v��)�����,fPy���8V��3A�IL5(2�E��5eY���0�pyg0aԦ��Ĕ�CdP#����Ʃ-W a�;J��)1-�(L ��%�FH�ܞ.��ax0���p���*&����`��X8l0d7B��yd�]"5����Q�wP��䐨+Q��W���y���bYl�#�����^)U���,���e��F�0�"teK.��w��aMLlI8�st�%y�\/�"�N7��j�)컴���m�q��ǡ��l�o%��}h�l&�
���Br+��6.�[Ͱ]�m�QVk-!�V;\����µ���S���&^������k7��g����y�>�).	���	A�8���n���+���sqT�J��8	�����܋�bv���o��j�pǧ��o������K/���?]k�]�{�^���c�X8Q���8���z����Cm��e9�s����Ƀt��7N���_�n<�@���y�__|���?=�^<߉?�u�J��~erEO�ym4��V�6��o�?�'?����n���󯁗����Г��x���HA��v���ޜ�v�jS;mj�M��i6M��v�_q��_q퀴����6�Ӧv�>��������[^F>�C�*W����Y�=�rAl�נ�B'��zl��c&�N�����/�C�MQ^�l�����<�S��)����a�{�38G����Af���צ��,��93v�՞3cO���sfl㰍�2̙9�|�#L��3s.w���Ui��.y�ɜ��/�:h\1�g�a�a��㿈�  