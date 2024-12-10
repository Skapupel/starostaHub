from rest_framework.response import Response
from rest_framework import status


def rest_default_response(data=None, message=None, status=status.HTTP_200_OK):
    return Response(data={"data": data, "message": message}, status=status)


def normalize_serializer_errors(serializer):
    errors = []
    for field, field_errors in serializer.errors.items():
        for error in field_errors:
            if "This field" in error:
                errors.append(error.replace("This field", field.capitalize()))
            else:
                errors.append(str(error))
    return errors


def rest_default_error_response(
    data=None, message=None, serializer=None, status=status.HTTP_400_BAD_REQUEST
):
    """
    Helper function to return a default error response.

    :param data: list or string of error messages (if serializer is None)
    :param message: string message
    :param serializer: serializer instance (if not None, errors will be normalized from serializer.errors)
    :param status: status code

    :return: Response
    """
    if serializer is not None:
        errors = normalize_serializer_errors(serializer)
        return Response(
            data={
                "data": {
                    "errors": errors,
                },
                "message": message,
            },
            status=status,
        )
    if isinstance(data, list):
        return Response(
            data={"data": {"errors": data}, "message": message}, status=status
        )
    return Response(
        data={"data": {"errors": [data]}, "message": message}, status=status
    )
