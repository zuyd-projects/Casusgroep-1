using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPNumber1.Migrations
{
    /// <inheritdoc />
    public partial class MakeSupplierOrderAppUserIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SupplierOrders_AspNetUsers_AppUserId",
                table: "SupplierOrders");

            migrationBuilder.AlterColumn<string>(
                name: "AppUserId",
                table: "SupplierOrders",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddForeignKey(
                name: "FK_SupplierOrders_AspNetUsers_AppUserId",
                table: "SupplierOrders",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SupplierOrders_AspNetUsers_AppUserId",
                table: "SupplierOrders");

            migrationBuilder.AlterColumn<string>(
                name: "AppUserId",
                table: "SupplierOrders",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SupplierOrders_AspNetUsers_AppUserId",
                table: "SupplierOrders",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
